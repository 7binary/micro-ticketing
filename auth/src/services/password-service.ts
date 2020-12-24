import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scriptAsync = promisify(scrypt);

export class PasswordService {
  static async toHash(password: string) {
    const salt = randomBytes(8).toString('hex');
    const buf = (await scriptAsync(password, salt, 64)) as Buffer;

    return `${buf.toString('hex')}.${salt}`;
  }

  static async compare(storedHash: string, providedPassword: string) {
    const [hashedPassword, salt] = storedHash.split('.');
    const buf = (await scriptAsync(providedPassword, salt, 64)) as Buffer;

    return buf.toString('hex') === hashedPassword;
  }
}