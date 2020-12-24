import { MongoMemoryServer } from 'mongodb-memory-server';
import { Types, connect, connection } from 'mongoose';
import jwt from 'jsonwebtoken';

let mongo: any;

jest.mock('../nats-wrapper.ts');
// jest.mock('../stripe.ts');

process.env.STRIPE_KEY = 'sk_test_51HzGHKHqD9cBwnPAHJAA0nxz3kwJT9OQ8MXZ1AzREj6mZKDqWfzZnpy4yhyANsFzx292qZn4sx53YuArq6FhT5aT00jJBJqLin';

beforeAll(async () => {
  // env
  process.env.JWT_KEY = 'asdf';

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await connection.close();
});

// test helpers
declare global {
  namespace NodeJS {
    interface Global {
      signin(id?: string): string[]
    }
  }
}

global.signin = (id?: string): string[] => {
  const payload = {
    id: id || Types.ObjectId().toHexString(),
    email: '7bin@bk.ru',
  };
  const sessionJSON = JSON.stringify({
    jwt: jwt.sign(payload, process.env.JWT_KEY!),
  });
  const base64 = Buffer.from(sessionJSON).toString('base64');

  return [`express:sess=${base64}`];
};
