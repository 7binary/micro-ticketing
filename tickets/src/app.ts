import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { errorHandler, NotFoundError, currentUser } from '@azticketing/common';
import { createRouter } from './routes/create';
import { showRouter } from './routes/show';
import { listRouter } from './routes/list';
import { updateRouter } from './routes/update';

const app = express();

app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({
  signed: false,
  secure: process.env.NODE_ENV !== 'test',
}));
app.use(currentUser);

app.use(createRouter);
app.use(showRouter);
app.use(listRouter);
app.use(updateRouter);

app.all('*', async () => {
  throw new NotFoundError();
});
app.use(errorHandler);

export { app };
