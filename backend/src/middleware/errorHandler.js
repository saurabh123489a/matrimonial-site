/**
 * Centralized error handling middleware
 * Catches and formats all errors consistently
 */
import { errorLogService } from '../services/errorLogService.js';

// 404 Not Found handler
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    status: false,
    message: `Route ${req.originalUrl} not found`
  });
};

// Global error handler
export const errorHandler = async (err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', err);
  console.error('Error Stack:', err.stack);

  // Extract user ID from request if available
  const userId = req.user?.id || null;

  // Log error to database (non-blocking - don't wait for it)
  errorLogService.logError(err, req, userId).catch(logErr => {
    console.error('Failed to log error to database:', logErr);
    // Don't throw - error logging failure shouldn't break the app
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      status: false,
      message: 'Validation error',
      errors: messages
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      status: false,
      message: `${field} already exists`
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      status: false,
      message: 'Invalid ID format'
    });
  }

  // Custom error with status code
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    status: false,
    message
  });
};

