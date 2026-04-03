/**
 * Error Handling Utilities
 * Centralized error management for Edge Functions
 */

import { createCorsResponse } from './cors.ts';

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  PAYMENT_ERROR = 'PAYMENT_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public status: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, ErrorCode.AUTHENTICATION_ERROR, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, ErrorCode.AUTHORIZATION_ERROR, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, ErrorCode.NOT_FOUND, 404);
  }
}

export class PaymentError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCode.PAYMENT_ERROR, 402, details);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorCode.DATABASE_ERROR, 500, details);
  }
}

/**
 * Handle errors and return appropriate HTTP response
 * @param error - Error object
 * @returns Response with error details
 */
export function handleError(error: unknown): Response {
  console.error('Edge Function Error:', error);

  if (error instanceof AppError) {
    return createCorsResponse(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      error.status
    );
  }

  if (error instanceof Error) {
    return createCorsResponse(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: error.message,
        },
      },
      500
    );
  }

  return createCorsResponse(
    {
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'An unexpected error occurred',
      },
    },
    500
  );
}

/**
 * Validate required fields in request data
 * @param data - Request data
 * @param requiredFields - Array of required field names
 * @throws ValidationError if any field is missing
 */
export function validateRequiredFields(
  data: Record<string, unknown>,
  requiredFields: string[]
): void {
  const missingFields = requiredFields.filter(field => !data[field]);

  if (missingFields.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missingFields.join(', ')}`,
      { missingFields }
    );
  }
}
