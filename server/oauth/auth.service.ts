import md5 from 'md5';
import User, { IUser } from './user.model';
import { BadRequestError, ConflictError, WS_ERRORS } from '../middlewares/error/errors';
import { Profile as FacebookProfile } from 'passport-facebook';
import { Profile as GoogleProfile } from 'passport-google-oauth';

export async function fFindOrCreate(profile: FacebookProfile): Promise<IUser> {
  const user: IUser | null = await User.findOne({ _fid: profile.id });
  if (user) return user;
  if (profile?._json?.email) {
    const checkEmail = await User.findOne({ email: profile?._json?.email });
    if (checkEmail) throw new ConflictError(WS_ERRORS.EXISTING_EMAIL);
  }
  const newUser = new User({
    _fid: profile?._json?.id,
    f_name: profile?._json?.first_name,
    l_name: profile?._json?.last_name,
    email: profile?._json?.email,
    sign_date: new Date(),
    confirmed: !!profile?._json?.email,
    status: 'member',
  });
  await newUser.save();
  return newUser;
}

export async function gFindOrCreate(profile: GoogleProfile): Promise<IUser> {
  const user: IUser | null = await User.findOne({ _gid: profile.id });
  if (user) return user;
  if (profile?._json?.email) {
    const checkEmail = await User.findOne({ email: profile?._json?.email });
    if (checkEmail) throw new ConflictError(WS_ERRORS.EXISTING_EMAIL);
  }
  const newUser = new User({
    _gid: profile?._json?.sub,
    f_name: profile?._json?.given_name,
    l_name: profile?._json?.family_name,
    email: profile?._json?.email,
    sign_date: new Date(),
    confirmed: !!profile?._json?.email,
    status: 'member',
  });
  await newUser.save();
  return newUser;
}

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
  fFindOrCreate,
  gFindOrCreate,
  lCreate
};

export default AuthService;
