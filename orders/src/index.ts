import 'express-async-errors';
import mongoose from 'mongoose';

import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener';
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created-listener';

const start = async () => {
  console.log('..starting');

  ['JWT_KEY', 'NATS_CLUSTER_ID', 'NATS_CLIENT_ID', 'NATS_URL', 'MONGO_URI', 'EXPIRE_SECONDS']
    .forEach(env => {
      if (!(env in process.env)) throw new Error(`${env} env must be defined!`);
    });

  try {
    // connect to NATS
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID!,
      process.env.NATS_CLIENT_ID!,
      process.env.NATS_URL!,
    );
    natsWrapper.client.on('close', () => {
      console.log('=> NATS listener on close');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();

    // connect to MONGODB
    await mongoose.connect(process.env.MONGO_URI!, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log(`=> Connected to ${process.env.MONGO_URI!}`);
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => console.log(`=> Listen 3000`));
};

start();
