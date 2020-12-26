import 'express-async-errors';
import mongoose from 'mongoose';

import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';

const start = async () => {
  console.log('..starting');

  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY env must be defined!');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI env must be defined!');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID env must be defined!');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID env must be defined!');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL env must be defined!');
  }

  try {
    // connect to NATS
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL,
    );
    natsWrapper.client.on('close', () => {
      console.log('=> NATS listener on close');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    // listeners for NATS
    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();

    // connect to MONGODB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log(`=> Connected to ${process.env.MONGO_URI}`);
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => console.log(`=> Listen 3000`));
};

start();
