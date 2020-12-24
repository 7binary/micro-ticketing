import request from 'supertest';
import { app } from '../../app';
import { Types } from 'mongoose';
import { Ticket } from '../../models/ticket';
import { OrderStatus } from '@azticketing/common';
import { Order } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';

it('returns a 404 if the order was not found to delete', async () => {
  const id = Types.ObjectId().toHexString();
  await request(app)
    .delete(`/api/orders/${id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(404);
});

it('mark the order as cancelled with code 200', async () => {
  const user = global.signin();
  const ticket = Ticket.build({
    id: Types.ObjectId().toHexString(),
    title: 'any',
    price: 1,
  });
  await ticket.save();

  const { body: { order: orderCreated } } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${orderCreated.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  const orderUpdated = await Order.findById(orderCreated.id);

  expect(orderUpdated?.status).toEqual(OrderStatus.Cancelled);
});

it('emits a order cancelled event', async () => {
  const user = global.signin();
  const ticket = Ticket.build({
    id: Types.ObjectId().toHexString(),
    title: 'concert',
    price: 10,
  });
  await ticket.save();

  const { body: { order } } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);
});
