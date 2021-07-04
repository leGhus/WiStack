import { model, Schema, Model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  _gid?: string;
  _fid?: string;
  f_name?: string;
  l_name?: string;
  email?: string;
  password: string;
  sign_date?: string | Date;
  confirmation_code?: string;
  confirmed?: boolean;
  status?: string;
  disabled?: boolean;
  desactivation_date?: string | Date;
}

export interface IExposedUser {
  _id: string;
  f_name?: string;
  l_name?: string;
  email?: string;
  sign_date?: string | Date;
}

export function getExposeUser(user: IUser): IExposedUser {
  return {
    _id: user._id,
    f_name: user.f_name,
    l_name: user.l_name,
    email: user.email,
    sign_date: user.sign_date,
  };
}

export const UserSchema = new Schema({
  _gid: { type: String, unique: true, sparse: true, index: true },
  _fid: { type: String, unique: true, sparse: true, index: true },
  email: { type: String, unique: true, index: true, sparse: true },
  f_name: { type: String, require: true },
  l_name: { type: String, require: true },
  sign_date: { type: Date, require: true },
  confirmed: { type: Boolean, required: true },
  status: { type: String, required: true },
  password: { type: String },
  confirmation_code: { type: String },
  disabled: { type: Boolean },
  desactivation_date: { type: Date },
});

UserSchema.pre('save', async function (this: IUser) {
  if (this.password) this.password = await bcrypt.hash(this.password, 10);
});

const User: Model<IUser> = model('User', UserSchema);
export default User;
