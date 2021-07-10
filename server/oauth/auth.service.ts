import md5 from 'md5';
import User, { IUser } from './user.model';
import { BadRequestError, WS_ERRORS } from '../middlewares/error/errors';

export async function lCreate(user: {
  email: string;
  f_name: string;
  l_name: string;
  password: string;
}): Promise<IUser> {
  const { email, f_name, l_name, password } = user;
  const checkEmail = await User.findOne({ email: email });
  if (checkEmail) throw new BadRequestError(WS_ERRORS.EXISTING_EMAIL);
  const x = Math.ceil(Math.random() * 1000000);
  const hash = md5(`${email}-${new Date().toDateString()}-${x}`);
  const newUser = new User({
    f_name: f_name,
    l_name: l_name,
    email: email,
    password: password,
    sign_date: new Date(),
    confirmed: false,
    confirmation_code: hash,
    status: 'member',
  });
  await newUser.save();
  return newUser;
}

const AuthService = {
  lCreate,
};

export default AuthService;
