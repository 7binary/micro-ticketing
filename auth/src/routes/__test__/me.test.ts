import request from 'supertest';
import { app } from '../../app';

it('should get info about a new user with 200 code with a cookie', async () => {
  const { email, cookie } = await global.signup();

  const response = await request(app)
    .get('/api/users/me')
    .set('Cookie', cookie)
    .expect(200);

  expect(response.body?.currentUser?.email).toEqual(email);
});

it('should response with null if not authenticated', async () => {
  const response = await request(app)
    .get('/api/users/me')
    .expect(200);

  expect(response.body?.currentUser).toEqual(null);
});
