import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, BadRequestError } from '@azticketing/common';

import { User } from '../models/user';
import { PasswordService } from '../services/password-service';
import { JwtService } from '../services/jwt-service';

const router = express.Router();

router.post('/api/users/signin', [
    body('email').isEmail().withMessage('Provide a valid email'),
    body('password').trim().notEmpty().withMessage('You must provide a password'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      const passwordsMatch = await PasswordService.compare(user.password, password);
      if (passwordsMatch) {
        // generate JWT
        req.session = { jwt: JwtService.generate(user) };

        res.send(user);
      }
    }

    throw new BadRequestError('Invalid credentials');
  });

export { router as signinRoute };
