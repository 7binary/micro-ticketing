import request from 'supertest';
import { app } from '../../app';

it('should sign out a new user with 200 code with a cookie', async () => {
  await global.signup();

  const response = await request(app)
    .post('/api/users/signout')
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});
