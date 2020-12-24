import express, { Request, Response } from 'express';
import { currentUser } from '@azticketing/common';

const router = express.Router();

router.get('/api/users/me', currentUser, (req: Request, res: Response) => {
  res.send({ currentUser: req.currentUser || null });
});

export { router as meRoute };
