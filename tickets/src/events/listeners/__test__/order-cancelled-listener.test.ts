import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { Types } from 'mongoose';
import { OrderCancelledEvent } from '@azticketing/common';
import { Message } from 'node-nats-streaming';
import { OrderCancelledListener } from '../order-cancelled-listener';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const ticket = Ticket.build({
    title: 'Any',
    price: 10,
    userId: Types.ObjectId().toHexString(),
  });
  ticket.set('orderId', Types.ObjectId().toHexString());
  await ticket.save();

  const data: OrderCancelledEvent['data'] = {
    id: Types.ObjectId().toHexString(),
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { ticket, listener, data, msg };
};

it('updates the ticket', async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).not.toBeDefined();
});

it('acks the message', async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toBeCalledTimes(1);
});

it('publishes the ticket updated event', async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toBeCalledTimes(1);
});
