import passport from 'passport';
import authController from './auth.controller';
import { Express } from 'express';
import './passport';

export function useAuth(app: Express): void {
  app.use(passport.initialize());
  app.use(passport.session());
  app.use('/api/auth', authController);
}
