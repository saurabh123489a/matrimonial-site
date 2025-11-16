/**
 * Custom Application Error Class
 * Standardizes error handling across the application
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = null, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    
    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Create a bad request error (400)
   */
  static badRequest(message, code = 'BAD_REQUEST') {
    return new AppError(message, 400, code, true);
  }

  /**
   * Create an unauthorized error (401)
   */
  static unauthorized(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    return new AppError(message, 401, code, true);
  }

  /**
   * Create a forbidden error (403)
   */
  static forbidden(message = 'Forbidden', code = 'FORBIDDEN') {
    return new AppError(message, 403, code, true);
  }

  /**
   * Create a not found error (404)
   */
  static notFound(message = 'Resource not found', code = 'NOT_FOUND') {
    return new AppError(message, 404, code, true);
  }

  /**
   * Create a conflict error (409)
   */
  static conflict(message, code = 'CONFLICT') {
    return new AppError(message, 409, code, true);
  }

  /**
   * Create a validation error (422)
   */
  static validation(message, code = 'VALIDATION_ERROR') {
    return new AppError(message, 422, code, true);
  }

  /**
   * Create an internal server error (500)
   */
  static internal(message = 'Internal server error', code = 'INTERNAL_ERROR') {
    return new AppError(message, 500, code, false);
  }

  /**
   * Convert error to JSON for API responses
   */
  toJSON() {
    return {
      status: false,
      message: this.message,
      code: this.code,
      ...(process.env.NODE_ENV === 'development' && {
        stack: this.stack,
      }),
    };
  }
}

export default AppError;

