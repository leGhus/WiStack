import passport from 'passport';
import bcrypt from 'bcrypt';
import { Strategy as LocalStrategy } from 'passport-local';
import {
  Profile as FacebookProfile,
  Strategy as FacebookStrategy,
} from 'passport-facebook';
import {
  Profile as GooleProfile,
  OAuth2Strategy as GoogleStrategy,
  VerifyFunction as GoogleVerifyFunction,
} from 'passport-google-oauth';
import User, { getExposedUser, IUser } from './user.model';
import {
  ProjectError,
  UnauthorizedError,
  WS_ERRORS,
} from '../middlewares/error/errors';
import AuthService from './auth.service';
import config from '../others/config';

passport.serializeUser(function (user: Express.User, done) {
  const usr: IUser = user as IUser;
  done(null, usr._id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const searchedUser: IUser | null = await User.findById(id);
    if (searchedUser) done(null, getExposedUser(searchedUser));
    else done(new ProjectError(WS_ERRORS.ERROR));
  } catch (e) {
    done(new ProjectError(WS_ERRORS.ERROR));
  }
});

passport.use(
  new FacebookStrategy(
    {
      clientID: config.facebook.clientID,
      clientSecret: config.facebook.clientSecret,
      callbackURL: `${config.url}/api/auth/facebook/callback`,
      profileFields: ['email', 'name'],
      enableProof: true,
    },
    async function (
      accessToken: string,
      refreshToken: string,
      profile: FacebookProfile,
      done: (error: any, user?: any, info?: any) => void,
    ) {
      try {
        const user: IUser = await AuthService.fFindOrCreate(profile);
        return done(null, getExposedUser(user));
      } catch (e) {
        return done(e);
      }
    },
  ),
);

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: `${config.url}/api/auth/google/callback`,
    },
    async function (
      accessToken: string,
      refreshToken: string,
      profile: GooleProfile,
      done: GoogleVerifyFunction,
    ) {
      try {
        const user: IUser = await AuthService.gFindOrCreate(profile);
        return done(null, getExposedUser(user));
      } catch (e) {
        return done(e, false);
      }
    },
  ),
);

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    (email: string, password: string, done) => {
      User.findOne({ email: email }, async (err: any, user: IUser | null) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(new UnauthorizedError(WS_ERRORS.EMAIL));
        }
        if (!(await bcrypt.compare(password, user.password || ''))) {
          return done(new UnauthorizedError(WS_ERRORS.PASSWORD));
        }
        return done(null, getExposedUser(user));
      });
    },
  ),
);
