import 'express-async-errors';
import mongoose from 'mongoose';

import { app } from './app';

const start = async () => {
  console.log('Starting up...');

  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY env must be defined!');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI env must be defined!');
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log(`=> Connected to ${process.env.MONGO_URI}`);
  } catch (err) {
    console.log(err);
  }

  app.listen(3000, () => console.log(`=> Listen 3000`));
};

start();
