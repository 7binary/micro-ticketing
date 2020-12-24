import express from 'express';
import { body } from 'express-validator';
import { BadRequestError, validateRequest } from '@azticketing/common';

import { User } from '../models/user';
import { JwtService } from '../services/jwt-service';

const router = express.Router();

router.post('/api/users/signup', [
    body('email').isEmail().withMessage('Provide a valid email'),
    body('password').trim().isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters length'),
  ],
  validateRequest,
  async (req: express.Request, res: express.Response) => {

    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError('Email is already in use');
    }

    // create and save user
    const user = User.build({ email, password });
    await user.save();

    // generate JWT
    req.session = { jwt: JwtService.generate(user) };

    res.status(201).send(user);
  });

export { router as signupRoute };
