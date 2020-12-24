import mongoose from 'mongoose';
import { OrderStatus } from '@azticketing/common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

export { OrderStatus };

interface OrderAttrs {
  id: string;
  userId: string;
  status: OrderStatus;
  price: number;
  version: number;
}

interface OrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  price: number;
  version: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const schema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(OrderStatus),
    default: OrderStatus.Created,
  },
  price: {
    type: Number,
    required: true,
  },
}, {
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
    },
  },
});

schema.set('versionKey', 'version');
schema.plugin(updateIfCurrentPlugin);

schema.static('build', (attrs: OrderAttrs) => {
  const formattedAttrs = { ...attrs, _id: attrs.id };
  delete formattedAttrs.id;

  return new Order(formattedAttrs);
});

const Order = mongoose.model<OrderDoc, OrderModel>('Order', schema);

export { Order };
