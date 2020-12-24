import { natsWrapper } from '../../../nats-wrapper';
import { Types } from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { TicketUpdatedEvent } from '@azticketing/common';

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client);
  const ticket = Ticket.build({
    id: Types.ObjectId().toHexString(),
    title: 'Any',
    price: 10,
  });
  await ticket.save();

  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket!.version + 1,
    title: 'New one',
    price: 300,
    userId: Types.ObjectId().toHexString(),
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket };
};

it('finds, updates and saves a ticket', async () => {
  const { listener, data, msg, ticket } = await setup();
  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toBeCalledTimes(1);
});

it('does not call ack if the event has skipped version number', async () => {
  const { listener, data, msg } = await setup();
  data.version = 101;

  await expect(async () => await listener.onMessage(data, msg))
    .rejects
    .toThrow('Ticket not found');
});
