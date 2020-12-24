import jwt from 'jsonwebtoken';

import { UserDoc } from '../models/user';

export class JwtService {
  static generate(user: UserDoc) {
    return jwt.sign({
      id: user.id,
      email: user.email,
    }, process.env.JWT_KEY!);
  }
}
