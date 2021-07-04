import express, { NextFunction } from 'express';
import passport from 'passport';
import AuthService from './auth.service';

import './passport';
import validator from 'validator';
import isEmail = validator.isEmail;
import { BadRequestError, ProjectError, WS_ERRORS } from '../others/errors';
import isEmpty = validator.isEmpty;
import isStrongPassword = validator.isStrongPassword;
import config from '../others/config';

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
  if (!isEmail(email || ''))
    throw new BadRequestError(WS_ERRORS.BAD_REQUEST, WS_ERRORS.EMAIL);
  if (isEmpty(f_name || ''))
    throw new BadRequestError(WS_ERRORS.BAD_REQUEST, WS_ERRORS.FIRST_NAME);
  if (isEmpty(l_name || ''))
    throw new BadRequestError(WS_ERRORS.BAD_REQUEST, WS_ERRORS.LAST_NAME);
  if (!isStrongPassword(password || ''))
    throw new BadRequestError(WS_ERRORS.BAD_REQUEST, WS_ERRORS.PASSWORD);
}

authController.post(
  '/sign/up',
  async (req: express.Request, res: express.Response, next: NextFunction) => {
    try {
      validateSignUp(req.body);
      // throw WS_ERRORS.BAD_REQUEST
      const { email, password, f_name, l_name } = req.body;
      await AuthService.lCreate({ email, password, f_name, l_name });
      res.status(204).json({ location: `${config.frontbaseUrl}/sign/in` });
    } catch (e) {
      next(e);
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
  if (!isEmail(email || ''))
    throw new BadRequestError(WS_ERRORS.BAD_REQUEST, WS_ERRORS.EMAIL);
  if (!isStrongPassword(password || ''))
    throw new BadRequestError(WS_ERRORS.BAD_REQUEST, WS_ERRORS.PASSWORD);
}

authController.post(
  '/sign/in',
  (req: express.Request, res: express.Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      validateSignIn({ email, password });
      passport.authenticate('local', (err, user, info) => {
        if (err) throw err;
        if (!user) throw new ProjectError(WS_ERRORS.ERROR);
        req.logIn(user, function (err) {
          if (err) throw err;
          return res.redirect(config.frontbaseUrl);
        });
      })(req, res, next);
    } catch (e) {
      next(e);
    }
  },
);

authController.get('/error', (req: express.Request, res: express.Response) =>
  res.send(WS_ERRORS.ERROR),
);
authController.get(
  '/logout',
  (req: express.Request, res: express.Response, next: NextFunction) => {
    try {
      req.logout();
      req.session.destroy((err) => {
        if (err) throw new ProjectError(WS_ERRORS.DISCONECT_ERROR);
        res.redirect(config.frontbaseUrl);
      });
    } catch (e) {
      next(e);
    }
  },
);

export default authController;
