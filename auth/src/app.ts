import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { meRoute } from './routes/me';
import { signupRoute } from './routes/signup';
import { signinRoute } from './routes/singin';
import { signoutRoute } from './routes/signout';
import { errorHandler, NotFoundError } from '@azticketing/common';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({
  signed: false,
  secure: process.env.NODE_ENV !== 'test',
}));

app.use(meRoute);
app.use(signupRoute);
app.use(signinRoute);
app.use(signoutRoute);

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
