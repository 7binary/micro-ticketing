import request from 'supertest';
import { Types } from 'mongoose';
import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

it('returns 404 if provided is does not exists', async () => {
  const id = Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({ title: 'First', price: 10 })
    .expect(404);
});

it('returns 401 if the user is not authenticated', async () => {
  const id = Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({ title: 'First', price: 10 })
    .expect(401);
});

it('returns 401 if the user does not own the ticket', async () => {
  const createResponse = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'Any', price: 10 })
    .expect(201);
  const { ticket } = createResponse.body;

  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set('Cookie', global.signin())
    .send({ title: 'Any', price: 10 })
    .expect(401);
});

it('returns 400 if the user provides invalid title or price', async () => {
  const cookie = global.signin();

  const createResponse = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'Any', price: 10 })
    .expect(201);
  const { ticket } = createResponse.body;

  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set('Cookie', cookie)
    .send({ title: '', price: 10 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set('Cookie', cookie)
    .send({ title: 'Any', price: -10 })
    .expect(400);
});

it('returns 400 if the ticket is already reserved', async () => {
  const cookie = global.signin();

  const createResponse = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'Any', price: 10 })
    .expect(201);
  const { ticket: ticketCreated } = createResponse.body;

  const ticket = await Ticket.findById(ticketCreated.id);
  ticket!.set('orderId', Types.ObjectId().toHexString());
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${ticket!.id}`)
    .set('Cookie', cookie)
    .send({ title: 'Anything', price: 100 })
    .expect(400);
});

it('updates the ticket provided valid inputs', async () => {
  const cookie = global.signin();

  const createResponse = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'Any', price: 10 })
    .expect(201);
  const { ticket } = createResponse.body;

  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set('Cookie', cookie)
    .send({ title: 'Changed', price: 100 })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${ticket.id}`)
    .set('Cookie', cookie)
    .send();

  expect(ticketResponse.body.ticket.title).toEqual('Changed');
  expect(ticketResponse.body.ticket.price).toEqual(100);
});

it('publishes an event', async () => {
  const cookie = global.signin();

  const createResponse = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'Any', price: 10 })
    .expect(201);
  const { ticket } = createResponse.body;

  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set('Cookie', cookie)
    .send({ title: 'Changed', price: 100 })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

