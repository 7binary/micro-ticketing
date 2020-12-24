import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('returns a 404 if the ticket was not found', async () => {
  const id = mongoose.Types.ObjectId().toHexString();
  await request(app)
    .get(`/api/tickets/${id}`)
    .send()
    .expect(404);
});

it('returns the ticket if ticket is found', async () => {
  const price = 100;
  const title = 'Title';

  const createResponse = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title, price })
    .expect(201);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${createResponse.body.ticket.id}`)
    .send()
    .expect(200);

  const { ticket } = ticketResponse.body;
  expect(ticket.title).toEqual(title);
  expect(ticket.price).toEqual(price);
});
