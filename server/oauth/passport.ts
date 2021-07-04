import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import User, { getExposeUser, IUser } from './user.model';
import { ProjectError, WS_ERRORS } from '../others/errors';

passport.serializeUser(function (user: Express.User, done) {
  const usr: IUser = user as IUser;
  done(null, usr._id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const searchedUser: IUser | null = await User.findById(id);
    if (searchedUser) done(null, getExposeUser(searchedUser));
    else done(new ProjectError(WS_ERRORS.ERROR));
  } catch (e) {
    done(new ProjectError(WS_ERRORS.ERROR));
  }
});

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    (email: string, password: string, done) => {
      User.findOne({ email: email }, async (err: any, user: IUser) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false);
        }
        if (!(await bcrypt.compare(password, user.password || ''))) {
          return done(null, false);
        }
        return done(null, getExposeUser(user));
      });
    },
  ),
);
