import request from 'supertest';
import { app } from '../../app';

const createTicket = (title = 'Any') => {
  return request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title, price: 10 })
    .expect(201);
};

it('can fetch a list of tickets', async () => {
  await createTicket('First');
  await createTicket('Second');

  const response = await request(app)
    .get('/api/tickets')
    .set('Cookie', global.signin())
    .send()
    .expect(200);
  const { tickets } = response.body;

  expect(tickets.length).toEqual(2);
});
