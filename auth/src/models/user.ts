import mongoose from 'mongoose';
import { PasswordService } from '../services/password-service';

interface UserAttrs {
  email: string;
  password: string;
}

export interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

const schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password;
    },
  },
});

schema.static('build', (attrs: UserAttrs) => {
  return new User(attrs);
});

schema.pre('save', async function(done) {
  /** @this UserDoc */
  if (this.isModified('password')) {
    const hash = await PasswordService.toHash(this.get('password'));
    this.set('password', hash);
  }
  done();
});

const User = mongoose.model<UserDoc, UserModel>('User', schema);

export { User };
