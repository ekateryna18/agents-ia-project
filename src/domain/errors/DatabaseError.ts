export class DatabaseError extends Error {
  public cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'DatabaseError';
    this.cause = cause;
    Error.captureStackTrace(this, this.constructor);
  }
}
