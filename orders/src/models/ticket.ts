import mongoose from 'mongoose';
import { Order, OrderStatus } from './order';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

export interface TicketDoc extends mongoose.Document {
  id: string;
  title: string;
  price: number;
  version: number;

  isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;

  findByEvent(event: {id: string, version: number}): Promise<TicketDoc | null>;
}

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    },
  },
});

schema.set('versionKey', 'version');
schema.plugin(updateIfCurrentPlugin);

schema.static('build', (attrs: TicketAttrs) => {
  const formattedAttrs = { ...attrs, _id: attrs.id };
  delete formattedAttrs['id'];

  return new Ticket(formattedAttrs);
});
schema.static('findByEvent', (event: {id: string, version: number}) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1,
  });
});
schema.method('isReserved', async function(this: TicketDoc) {
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Completed,
      ],
    },
  });

  return !!existingOrder;
});

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', schema);

export { Ticket };
