import { natsWrapper } from '../../../nats-wrapper';
import { Types } from 'mongoose';
import { OrderCancelledEvent, OrderStatus } from '@azticketing/common';
import { Message } from 'node-nats-streaming';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { Order } from '../../../models/order';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: Types.ObjectId().toHexString(),
    price: 100,
    status: OrderStatus.Created,
    userId: Types.ObjectId().toHexString(),
    version: 0,
  });
  await order.save();

  const data: OrderCancelledEvent['data'] = {
    id: order.id as string,
    version: 1,
    ticket: {
      id: Types.ObjectId().toHexString(),
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { order, listener, data, msg };
};

it('updates the status of the order', async () => {
  const { listener, order, data, msg } = await setup();
  await listener.onMessage(data, msg);
  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
  const { listener, order, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toBeCalledTimes(1);
});

