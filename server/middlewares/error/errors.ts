export class CustomError extends Error {
  public statusCode: number;

  constructor(name: string, statusCode: number, message?: string) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
  }
}

export class BadRequestError extends CustomError {
  constructor(message?: string) {
    super(WS_ERRORS.BAD_REQUEST, 400, message);
  }
}

export class ProjectError extends CustomError {
  constructor(message?: string) {
    super(WS_ERRORS.ERROR, 500, message);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message?: string) {
    super(WS_ERRORS.FORBIDDEN, 403, message);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message?: string) {
    super(WS_ERRORS.UNAUTHORIZED, 401, message);
  }
}

export class ConflictError extends CustomError {
  constructor(message?: string) {
    super(WS_ERRORS.CONFLICT, 409, message);
  }
}

export const WS_ERRORS = {
  BAD_REQUEST: 'BAD_REQUEST',
  FORBIDDEN: 'FORBIDDEN',
  UNAUTHORIZED: 'UNAUTHORIZED',
  CONFLICT: 'CONFLICT',
  EXISTING_EMAIL: 'EXISTING_EMAIL',
  ERROR: 'ERROR',
  DISCONECT_ERROR: 'DISCONECT_ERROR',
  EMAIL: 'EMAIL',
  FIRST_NAME: 'FIRST_NAME',
  LAST_NAME: 'LAST_NAME',
  PASSWORD: 'PASSWORD',
};
