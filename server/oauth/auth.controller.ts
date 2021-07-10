import express, { NextFunction } from 'express';
import passport from 'passport';
import AuthService from './auth.service';

import './passport';
import validator from 'validator';
import isEmail = validator.isEmail;
import {
  BadRequestError,
  ProjectError,
  WS_ERRORS,
} from '../middlewares/error/errors';
import isEmpty = validator.isEmpty;
import isStrongPassword = validator.isStrongPassword;
import config from '../others/config';
import { errorHandler } from '../middlewares/error/errorHandler';

const authController = express.Router();

function validateSignUp({
  email,
  password,
  f_name,
  l_name,
}: {
  email: string;
  password: string;
  f_name: string;
  l_name: string;
}) {
  if (!isEmail(email || '')) throw new BadRequestError(WS_ERRORS.EMAIL);
  if (isEmpty(f_name || '')) throw new BadRequestError(WS_ERRORS.FIRST_NAME);
  if (isEmpty(l_name || '')) throw new BadRequestError(WS_ERRORS.LAST_NAME);
  if (!isStrongPassword(password || ''))
    throw new BadRequestError(WS_ERRORS.PASSWORD);
}

// facebook authentication

authController.get(
  '/facebook',
  passport.authenticate('facebook', { scope: 'email' }),
  (req: express.Request, res: express.Response) => {
    res.end();
  },
);

authController.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: `${config.frontbaseUrl}/sign/up`,
    successRedirect: config.frontbaseUrl,
  }),
);

// google authentication

authController.get(
  '/google',
  passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  }),
);

authController.get(
  '/google/callback',
  (req: express.Request, res: express.Response) => {
    passport.authenticate('google', (e, user) => {
      if (e) return res.redirect(`${config.frontbaseUrl}/error`);
      if (user) return res.redirect(config.frontbaseUrl);
      return res.redirect(`${config.frontbaseUrl}/error`);
    })(req, res);
  },
);

authController.post(
  '/sign/up',
  async (req: express.Request, res: express.Response) => {
    try {
      validateSignUp(req.body);
      const { email, password, f_name, l_name } = req.body;
      await AuthService.lCreate({ email, password, f_name, l_name });
      return res.redirect(config.frontbaseUrl);
    } catch (e) {
      errorHandler(e, req, res);
    }
  },
);

function validateSignIn({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  if (!isEmail(email || '')) throw new BadRequestError(WS_ERRORS.EMAIL);
  if (!isStrongPassword(password || ''))
    throw new BadRequestError(WS_ERRORS.PASSWORD);
}

authController.post(
  '/sign/in',
  (req: express.Request, res: express.Response) => {
    try {
      const { email, password } = req.body;
      validateSignIn({ email, password });
      passport.authenticate('local', (err, user) => {
        if (err) errorHandler(err, req, res);
        req.logIn(user, function (error) {
          if (error) throw error;
          res.status(200).json({ location: config.frontbaseUrl });
        });
      })(req, res);
    } catch (e) {
      errorHandler(e, req, res);
    }
  },
);

authController.get('/error', (req: express.Request, res: express.Response) =>
  res.send(WS_ERRORS.ERROR),
);
authController.get('/logout', (req: express.Request, res: express.Response) => {
  try {
    req.logout();
    req.session.destroy((err) => {
      if (err) throw new ProjectError(WS_ERRORS.DISCONECT_ERROR);
      res.redirect(config.frontbaseUrl);
    });
  } catch (e) {
    errorHandler(e, req, res);
  }
});

export default authController;
