import { errorLogRepository } from '../repositories/errorLogRepository.js';
import { getDeviceInfo } from '../utils/deviceInfo.js';

export const errorLogService = {
  /**
   * Log an error to the database
   */
  async logError(error, req = null, userId = null) {
    try {
      let deviceInfo = null;
      let requestInfo = null;

      if (req) {
        deviceInfo = getDeviceInfo(req);
        requestInfo = {
          method: req.method,
          url: req.url,
          body: req.body,
          query: req.query,
          params: req.params,
          headers: {
            'user-agent': req.headers['user-agent'],
            'content-type': req.headers['content-type'],
            // Don't log sensitive headers
          },
        };
      }

      // Determine error type
      let errorType = 'unknown';
      let statusCode = 500;

      if (error.status) {
        statusCode = error.status;
        if (error.status >= 400 && error.status < 500) {
          if (error.status === 401 || error.status === 403) {
            errorType = 'authentication';
          } else if (error.status === 422 || error.status === 400) {
            errorType = 'validation';
          } else {
            errorType = 'api';
          }
        } else if (error.status >= 500) {
          errorType = 'database';
        }
      }

      if (error.name === 'ValidationError' || error.name === 'CastError') {
        errorType = 'validation';
      } else if (error.name === 'MongoError' || error.name === 'MongooseError') {
        errorType = 'database';
      }

      const errorLog = {
        userId,
        errorType,
        statusCode,
        message: error.message || 'Unknown error',
        stack: error.stack,
        request: requestInfo,
        device: deviceInfo?.deviceInfo || null,
        resolved: false,
      };

      const savedLog = await errorLogRepository.create(errorLog);
      return savedLog;
    } catch (logError) {
      // Fallback: Log to console if database logging fails
      // This should never throw an error to avoid breaking the application
      console.error('Failed to log error to database:', logError);
      console.error('Original error:', error.message || error);
      // Return null instead of throwing to prevent cascading errors
      return null;
    }
  },

  /**
   * Mark an error as resolved
   */
  async resolveError(errorId, resolvedBy, notes) {
    return await errorLogRepository.markResolved(errorId, resolvedBy, notes);
  },

  /**
   * Get unresolved errors
   */
  async getUnresolvedErrors(limit = 50) {
    return await errorLogRepository.getUnresolvedErrors(limit);
  },
};

