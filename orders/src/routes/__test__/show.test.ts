import request from 'supertest';
import { app } from '../../app';
import { Types } from 'mongoose';
import { Ticket } from '../../models/ticket';

it('returns a 404 if the order was not found', async () => {
  const id = Types.ObjectId().toHexString();
  await request(app)
    .get(`/api/orders/${id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(404);
});

it('returns 401 the user does not own the order', async () => {
  const ticket = Ticket.build({
    id: Types.ObjectId().toHexString(),
    title: 'any',
    price: 1,
  });
  await ticket.save();

  const user1 = global.signin();
  const user2 = global.signin();

  const { body: { order: orderCreated } } = await request(app)
    .post('/api/orders')
    .set('Cookie', user1)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .get(`/api/orders/${orderCreated.id}`)
    .set('Cookie', user2)
    .send()
    .expect(401);
});

it('returns the order if it is found', async () => {
  const ticket = Ticket.build({
    id: Types.ObjectId().toHexString(),
    title: 'any',
    price: 1,
  });
  await ticket.save();

  const user = global.signin();

  const { body: { order: orderCreated } } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: { order: orderFetched } } = await request(app)
    .get(`/api/orders/${orderCreated.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);

  expect(orderCreated.id).toEqual(orderFetched.id);
});
