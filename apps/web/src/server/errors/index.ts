// Shared error type used by services and route handlers.
// Route handlers map these to HTTP responses; services throw them.

export type ServiceErrorCode =
  | 'NOT_FOUND'
  | 'BAD_REQUEST'
  | 'CONFLICT'
  | 'INTERNAL';

export class ServiceError extends Error {
  public readonly code: ServiceErrorCode;
  public readonly status: number;

  constructor(code: ServiceErrorCode, message: string) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
    this.status = codeToStatus(code);
  }
}

function codeToStatus(code: ServiceErrorCode): number {
  switch (code) {
    case 'NOT_FOUND':
      return 404;
    case 'BAD_REQUEST':
      return 400;
    case 'CONFLICT':
      return 409;
    case 'INTERNAL':
    default:
      return 500;
  }
}
