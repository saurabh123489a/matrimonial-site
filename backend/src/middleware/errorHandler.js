/**
 * Centralized error handling middleware
 * Catches and formats all errors consistently
 */
import { errorLogService } from '../services/errorLogService.js';
import { formatErrorResponse, AppError } from '../utils/errors.js';

// 404 Not Found handler
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    status: false,
    message: `Route ${req.originalUrl} not found`
  });
};

/**
 * Global error handler middleware
 * Handles all errors consistently and formats responses
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const errorHandler = async (err, req, res, next) => {
  // Extract user ID from request if available
  const userId = req.user?.id || null;

  // Log error for debugging (only in development or log all errors)
  if (process.env.NODE_ENV === 'production') {
    // In production, only log error message (hide stack traces)
    console.error('Error:', err.message);
  } else {
    // In development, log full error details
    console.error('Error:', err);
    console.error('Error Stack:', err.stack);
  }

  // Log error to database (non-blocking - don't wait for it)
  errorLogService.logError(err, req, userId).catch(logErr => {
    console.error('Failed to log error to database:', logErr);
    // Don't throw - error logging failure shouldn't break the app
  });

  // Format error response using centralized formatter
  const errorResponse = formatErrorResponse(err);
  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json(errorResponse);
};

