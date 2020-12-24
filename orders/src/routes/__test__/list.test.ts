import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Types } from 'mongoose';

async function buildTicket() {
  const ticket = Ticket.build({
    id: Types.ObjectId().toHexString(),
    title: 'any',
    price: 1,
  });
  await ticket.save();

  return ticket;
}

it('show orders for a particular user', async () => {
  const ticket1 = await buildTicket();
  const ticket2 = await buildTicket();
  const ticket3 = await buildTicket();

  const user1 = global.signin();
  const user2 = global.signin();

  await request(app)
    .post('/api/orders')
    .set('Cookie', user1)
    .send({ ticketId: ticket1.id })
    .expect(201);

  const { body: { order: order2 } } = await request(app)
    .post('/api/orders')
    .set('Cookie', user2)
    .send({ ticketId: ticket2.id })
    .expect(201);

  const { body: { order: order3 } } = await request(app)
    .post('/api/orders')
    .set('Cookie', user2)
    .send({ ticketId: ticket3.id })
    .expect(201);

  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', user2)
    .expect(200);
  const { orders } = response.body;

  expect(orders.length).toEqual(2);
  expect(orders[0].id).toEqual(order2.id);
  expect(orders[1].id).toEqual(order3.id);
  expect(orders[0].ticket.id).toEqual(ticket2.id);
  expect(orders[1].ticket.id).toEqual(ticket3.id);

});
