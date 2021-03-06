import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

let mongo: any;

jest.mock('../nats-wrapper.ts');

beforeAll(async () => {
  // env
  process.env.JWT_KEY = 'asdf';

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

// test helpers
declare global {
  namespace NodeJS {
    interface Global {
      signin(): string[]
    }
  }
}

global.signin = (): string[] => {
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: '7bin@bk.ru',
  };
  const sessionJSON = JSON.stringify({
    jwt: jwt.sign(payload, process.env.JWT_KEY!),
  });
  const base64 = Buffer.from(sessionJSON).toString('base64');

  return [`express:sess=${base64}`];
};
