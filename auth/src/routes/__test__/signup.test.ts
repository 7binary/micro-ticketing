import request from 'supertest';
import {app} from '../../app';

it('should sign up a new user with 201 code with a cookie and duplicate with 400 error', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({email: 'test@test.com', password: '123123' })
    .expect(201);

  expect(response.get('Set-Cookie')).toBeDefined();

  await request(app)
    .post('/api/users/signup')
    .send({email: 'test@test.com', password: '123123' })
    .expect(400);
});

it('should await 400 with invalid email', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({email: 'tt.com', password: '123123' })
    .expect(400);
});

it('should await 400 with invalid password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({email: 'tt@tt.com', password: '' })
    .expect(400);
});

it('should await 400 with invalid password or email', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({email: 'tt@tt.com' })
    .expect(400);

  await request(app)
    .post('/api/users/signup')
    .send({password: '123123' })
    .expect(400);
});