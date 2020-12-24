import request from 'supertest';
import { app } from '../../app';

it('should sign in existing user with 200 code with a cookie and fail if invalid password', async () => {
  const { email, password } = await global.signup();

  const response = await request(app)
    .post('/api/users/signin')
    .send({ email, password })
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();

  await request(app)
    .post('/api/users/signin')
    .send({ email, password: 'aaabbb' })
    .expect(400);
});

it('should fail with 400 if no user found or invalid email or password', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({ email: 'test@test.com', password: '123123' })
    .expect(400);

  await request(app)
    .post('/api/users/signin')
    .send({})
    .expect(400);
});
