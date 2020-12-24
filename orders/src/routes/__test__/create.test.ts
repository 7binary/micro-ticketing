import request from 'supertest';
import { app } from '../../app';
import { Types } from 'mongoose';
import { Ticket } from '../../models/ticket';
import { Order } from '../../models/order';
import { OrderStatus } from '@azticketing/common';
import { natsWrapper } from '../../nats-wrapper';


it('has a route handler listening for post request to /api/orders', async () => {
  const response = await request(app)
    .post('/api/orders')
    .send({});

  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  await request(app)
    .post('/api/orders')
    .send({})
    .expect(401);
});

it('expect not 401 response if user is signed in', async () => {
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('returns an error if ticketId is empty', async () => {
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: '' })
    .expect(400);
});

it('returns an error if the ticket does not exists', async () => {
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: Types.ObjectId().toHexString() })
    .expect(404);
});

it('returns an error if the ticket is reserved', async () => {
  const ticket = Ticket.build({
    id: Types.ObjectId().toHexString(),
    title: 'concert',
    price: 10,
  });
  await ticket.save();

  const order = Order.build({
    ticket: ticket,
    userId: Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it('reserves the ticket with a new order', async () => {
  const ticket = Ticket.build({
    id: Types.ObjectId().toHexString(),
    title: 'concert',
    price: 10,
  });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  const orders = await Order.find({});
  expect(orders.length).toEqual(1);
});

it('emit order created event', async () => {
  const ticket = Ticket.build({
    id: Types.ObjectId().toHexString(),
    title: 'concert',
    price: 10,
  });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
