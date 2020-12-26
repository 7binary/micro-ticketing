import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

const start = async () => {
  console.log('..starting');

  ['NATS_CLUSTER_ID', 'NATS_CLIENT_ID', 'NATS_URL', 'REDIS_HOST'].forEach(env => {
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

    new OrderCreatedListener(natsWrapper.client).listen();
  } catch (err) {
    console.error(err);
  }
};

start();
