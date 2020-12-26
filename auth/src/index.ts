import 'express-async-errors';
import mongoose from 'mongoose';

import { app } from './app';

const start = async () => {
  console.log('..starting');

  ['JWT_KEY', 'MONGO_URI'].forEach(env => {
    if (!(env in process.env)) throw new Error(`${env} env must be defined!`);
  });

  try {
    await mongoose.connect(process.env.MONGO_URI!, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log(`=> Connected to ${process.env.MONGO_URI!}`);
  } catch (err) {
    console.log(err);
  }

  app.listen(3000, () => console.log(`=> Listen 3000`));
};

start();
