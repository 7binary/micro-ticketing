import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import {
  NotFoundError,
  NotAuthorizedError,
  validateRequest,
  requireAuth, BadRequestError,
} from '@azticketing/common';
import { natsWrapper } from '../nats-wrapper';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';

const router = express.Router();
const rules = [
  body('title').not().isEmpty().withMessage('Title is required'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
];

router.put('/api/tickets/:id', requireAuth, rules, validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }
    if (ticket.orderId) {
      throw new BadRequestError('Cannot edit reserved ticket');
    }
    if (req.currentUser!.id !== ticket.userId) {
      throw new NotAuthorizedError();
    }

    ticket.title = title;
    ticket.price = price;
    await ticket.save();

    await new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket._id!,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.send({ ticket });
  });

export { router as updateRouter };
