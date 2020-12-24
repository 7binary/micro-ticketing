import request from 'supertest';
import { app } from '../../app';
import { Types } from 'mongoose';
import { Order } from '../../models/order';
import { OrderStatus } from '@azticketing/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

it('returns 404 when the puchasing an order does not exists', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'asdf',
      orderId: Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('returns 401 when purchasing an order doesnt belong to the user', async () => {
  const order = Order.build({
    id: Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    version: 0,
    price: 100,
    userId: Types.ObjectId().toHexString(),
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'asdf',
      orderId: order.id,
    })
    .expect(401);
});

it('returns 400 when purchasing a cancelled', async () => {
  const userId = Types.ObjectId().toHexString();
  const order = Order.build({
    id: Types.ObjectId().toHexString(),
    status: OrderStatus.Cancelled,
    version: 0,
    price: 100,
    userId,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'asdf',
      orderId: order.id,
    })
    .expect(400);
});

it('returns 201 with valid inputs', async () => {
  const userId = Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 10000);
  const order = Order.build({
    id: Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId,
    price,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order._id,
    })
    .expect(201);

  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find(charge => charge.amount === price * 100);

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual('usd');

  const payment = await Payment.findOne({
    orderId: order._id,
    stripeId: stripeCharge!.id,
  });
  expect(payment).not.toBeNull();

  // const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  // expect(chargeOptions.source).toEqual('tok_visa');
  // expect(chargeOptions.amount).toEqual(20 * 100);
  // expect(chargeOptions.currency).toEqual('usd');
});
