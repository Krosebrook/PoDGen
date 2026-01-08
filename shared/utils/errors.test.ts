import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  RateLimitError,
  SafetyError,
  ApiError,
  ErrorCode,
} from './errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create an AppError with required properties', () => {
      const error = new AppError(
        'Test error message',
        ErrorCode.INTERNAL_ERROR,
        500
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.name).toBe('AppError');
      expect(error.message).toBe('Test error message');
      expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
    });

    it('should format error title from error code', () => {
      const error = new AppError(
        'Test message',
        ErrorCode.VALIDATION_ERROR,
        400
      );

      expect(error.title).toBe('Validation Error');
    });

    it('should accept optional context', () => {
      const context = { userId: '123', action: 'upload' };
      const error = new AppError(
        'Context test',
        ErrorCode.INTERNAL_ERROR,
        500,
        context
      );

      expect(error.context).toEqual(context);
      expect(error.context?.userId).toBe('123');
    });

    it('should default to operational error', () => {
      const error = new AppError(
        'Test',
        ErrorCode.INTERNAL_ERROR,
        500
      );

      expect(error.isOperational).toBe(true);
    });

    it('should allow setting isOperational to false', () => {
      const error = new AppError(
        'Test',
        ErrorCode.INTERNAL_ERROR,
        500,
        undefined,
        false
      );

      expect(error.isOperational).toBe(false);
    });
  });

  describe('ValidationError', () => {
    it('should create a ValidationError with correct defaults', () => {
      const error = new ValidationError('Invalid input');

      expect(error).toBeInstanceOf(ValidationError);
      expect(error).toBeInstanceOf(AppError);
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.statusCode).toBe(400);
    });

    it('should accept field validation errors', () => {
      const fields = {
        email: ['Invalid email format'],
        password: ['Password too short', 'Must contain special character'],
      };
      const error = new ValidationError('Validation failed', fields);

      expect(error.context?.fields).toEqual(fields);
    });
  });

  describe('AuthenticationError', () => {
    it('should create AuthenticationError with default message', () => {
      const error = new AuthenticationError();

      expect(error).toBeInstanceOf(AuthenticationError);
      expect(error.name).toBe('AuthenticationError');
      expect(error.message).toBe('Security context negotiation failed.');
      expect(error.code).toBe(ErrorCode.AUTHENTICATION_ERROR);
      expect(error.statusCode).toBe(401);
    });

    it('should accept custom message', () => {
      const error = new AuthenticationError('Invalid API key');

      expect(error.message).toBe('Invalid API key');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('RateLimitError', () => {
    it('should create RateLimitError with correct defaults', () => {
      const error = new RateLimitError();

      expect(error).toBeInstanceOf(RateLimitError);
      expect(error.name).toBe('RateLimitError');
      expect(error.message).toBe('Generation throughput exceeded. System cooling down.');
      expect(error.code).toBe(ErrorCode.RATE_LIMITED);
      expect(error.statusCode).toBe(429);
    });

    it('should accept retryAfter parameter', () => {
      const error = new RateLimitError(60);

      expect(error.context?.retryAfter).toBe(60);
    });
  });

  describe('SafetyError', () => {
    it('should create SafetyError with default message', () => {
      const error = new SafetyError();

      expect(error).toBeInstanceOf(SafetyError);
      expect(error.name).toBe('SafetyError');
      expect(error.message).toBe('Pipeline interrupted by deep safety filters.');
      expect(error.code).toBe(ErrorCode.SAFETY_ERROR);
      expect(error.statusCode).toBe(400);
    });

    it('should accept custom message', () => {
      const error = new SafetyError('Content blocked by safety filters');

      expect(error.message).toBe('Content blocked by safety filters');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('ApiError', () => {
    it('should create ApiError with correct defaults', () => {
      const error = new ApiError('API request failed');

      expect(error).toBeInstanceOf(ApiError);
      expect(error.name).toBe('ApiError');
      expect(error.message).toBe('API request failed');
      expect(error.code).toBe(ErrorCode.API_ERROR);
      expect(error.statusCode).toBe(500);
    });

    it('should accept custom status code', () => {
      const error = new ApiError('Not found', 404);

      expect(error.message).toBe('Not found');
      expect(error.statusCode).toBe(404);
    });

    it('should handle service unavailable errors', () => {
      const error = new ApiError('Service unavailable', 503);

      expect(error.statusCode).toBe(503);
    });
  });

  describe('Error Inheritance', () => {
    it('should maintain proper prototype chain', () => {
      const appError = new AppError('test', ErrorCode.INTERNAL_ERROR, 500);
      const validationError = new ValidationError('test');
      const authError = new AuthenticationError();

      expect(appError instanceof Error).toBe(true);
      expect(validationError instanceof Error).toBe(true);
      expect(validationError instanceof AppError).toBe(true);
      expect(authError instanceof Error).toBe(true);
      expect(authError instanceof AppError).toBe(true);
    });

    it('should allow catching by base class', () => {
      const errors = [
        new ValidationError('validation'),
        new AuthenticationError('auth'),
        new ApiError('api', 500),
      ];

      errors.forEach(error => {
        expect(error).toBeInstanceOf(AppError);
      });
    });
  });
});
