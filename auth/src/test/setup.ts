import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';

let mongo: any;

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
      signup(): Promise<{email: string, password: string, cookie: string[]}>
    }
  }
}

global.signup = async (): Promise<{email: string, password: string, cookie: string[]}> => {
  const email = 'test@test.com';
  const password = 'password';

  const response = await request(app)
    .post('/api/users/signup')
    .send({ email, password })
    .expect(201);
  const cookie = response.get('Set-Cookie');

  return { email, password, cookie };
};
