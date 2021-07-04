import express from 'express';
import { CustomError, WS_ERRORS } from '../others/errors';

export function errorMiddleware(error: CustomError, req: express.Request, res: express.Response): void {
  if (req && error) {
    if (
      error?.name === WS_ERRORS.BAD_REQUEST
      || error?.name === WS_ERRORS.UNAUTHORIZED
      || error?.name === WS_ERRORS.FORBIDDEN
      || error?.name === WS_ERRORS.ERROR
    ) {
      res.status(error.statusCode ?? 500).send({ error: { name: error.name, message: error.message } });
      return;
    }
    res.status(500).send({ error: WS_ERRORS.ERROR });
  }
}