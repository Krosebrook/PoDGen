
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  API_ERROR = 'API_ERROR',
  SAFETY_ERROR = 'SAFETY_ERROR',
}

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly statusCode: number = 500,
    public readonly context?: Record<string, unknown>,
    public readonly isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, fields?: Record<string, string[]>) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, { fields });
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed.') {
    super(message, ErrorCode.AUTHENTICATION_ERROR, 401);
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super('Too many requests. Please try again later.', ErrorCode.RATE_LIMITED, 429, { retryAfter });
    this.name = 'RateLimitError';
  }
}

export class SafetyError extends AppError {
  constructor(message: string = 'Content blocked by safety filters.') {
    super(message, ErrorCode.SAFETY_ERROR, 400);
    this.name = 'SafetyError';
  }
}

export class ApiError extends AppError {
  constructor(message: string, statusCode: number = 500) {
    super(message, ErrorCode.API_ERROR, statusCode);
    this.name = 'ApiError';
  }
}
