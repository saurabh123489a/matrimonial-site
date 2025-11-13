/**
 * Custom Error Classes
 * Standardized error handling across the application
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {boolean} isOperational - Whether this is an operational error (vs programming error)
   */
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends AppError {
  /**
   * @param {string} message - Error message
   * @param {Array} errors - Array of validation errors
   */
  constructor(message = 'Validation error', errors = []) {
    super(message, 400);
    this.errors = errors;
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
  /**
   * @param {string} resource - Resource name (e.g., 'User', 'Profile')
   * @param {string} identifier - Identifier that was not found
   */
  constructor(resource = 'Resource', identifier = '') {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, 404);
    this.resource = resource;
    this.identifier = identifier;
  }
}

/**
 * Unauthorized error (401)
 */
export class UnauthorizedError extends AppError {
  /**
   * @param {string} message - Error message
   */
  constructor(message = 'Unauthorized access') {
    super(message, 401);
  }
}

/**
 * Forbidden error (403)
 */
export class ForbiddenError extends AppError {
  /**
   * @param {string} message - Error message
   */
  constructor(message = 'Forbidden: You do not have permission to perform this action') {
    super(message, 403);
  }
}

/**
 * Conflict error (409)
 */
export class ConflictError extends AppError {
  /**
   * @param {string} message - Error message
   * @param {string} field - Field that caused the conflict
   */
  constructor(message = 'Resource conflict', field = '') {
    super(message, 409);
    this.field = field;
  }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends AppError {
  /**
   * @param {string} message - Error message
   * @param {number} retryAfter - Seconds to wait before retrying
   */
  constructor(message = 'Too many requests', retryAfter = 60) {
    super(message, 429);
    this.retryAfter = retryAfter;
  }
}

/**
 * Database error (500)
 */
export class DatabaseError extends AppError {
  /**
   * @param {string} message - Error message
   * @param {Error} originalError - Original database error
   */
  constructor(message = 'Database error', originalError = null) {
    super(message, 500);
    this.originalError = originalError;
  }
}

/**
 * External service error (502)
 */
export class ExternalServiceError extends AppError {
  /**
   * @param {string} service - Service name
   * @param {string} message - Error message
   */
  constructor(service = 'External service', message = 'External service error') {
    super(`${service}: ${message}`, 502);
    this.service = service;
  }
}

/**
 * Handle and format errors for API responses
 * @param {Error} error - Error object
 * @returns {Object} Formatted error response
 */
export function formatErrorResponse(error) {
  // Handle custom AppError
  if (error instanceof AppError) {
    return {
      status: false,
      message: error.message,
      ...(error.errors && { errors: error.errors }),
      ...(error.field && { field: error.field }),
      ...(error.retryAfter && { retryAfter: error.retryAfter }),
    };
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(e => ({
      field: e.path,
      message: e.message,
    }));
    return {
      status: false,
      message: 'Validation error',
      errors,
    };
  }

  // Handle Mongoose duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return {
      status: false,
      message: `${field} already exists`,
      field,
    };
  }

  // Handle Mongoose cast errors
  if (error.name === 'CastError') {
    return {
      status: false,
      message: `Invalid ${error.path}: ${error.value}`,
      field: error.path,
    };
  }

  // Default error response
  return {
    status: false,
    message: error.message || 'Internal server error',
  };
}

