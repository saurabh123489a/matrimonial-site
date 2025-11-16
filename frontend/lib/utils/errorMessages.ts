/**
 * Error message translation utility
 * Converts API error messages to user-friendly, translated messages
 */

import { useTranslation } from '@/hooks/useTranslation';

export interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: string;
      errors?: any;
    };
    status?: number;
  };
  message?: string;
  code?: string;
  isCorsError?: boolean;
}

/**
 * Get user-friendly error message from API error
 */
export function getErrorMessage(error: ApiError | any, t?: (key: string) => string): string {
  const translate = t || ((key: string) => key);

  // CORS/Network errors
  if (error.isCorsError || error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
    return translate('errors.networkError') || 'Unable to connect to server. Please check your internet connection.';
  }

  // HTTP status code errors
  if (error.response?.status) {
    const status = error.response.status;
    
    switch (status) {
      case 400:
        return error.response.data?.message || translate('errors.badRequest') || 'Invalid request. Please check your input.';
      case 401:
        return translate('errors.unauthorized') || 'Please login to continue.';
      case 403:
        return translate('errors.forbidden') || 'You do not have permission to perform this action.';
      case 404:
        return translate('errors.notFound') || 'The requested resource was not found.';
      case 409:
        return error.response.data?.message || translate('errors.conflict') || 'This resource already exists.';
      case 422:
        return error.response.data?.message || translate('errors.validationError') || 'Please check your input and try again.';
      case 429:
        return translate('errors.tooManyRequests') || 'Too many requests. Please try again later.';
      case 500:
        return translate('errors.serverError') || 'Server error. Please try again later.';
      case 503:
        return translate('errors.serviceUnavailable') || 'Service temporarily unavailable. Please try again later.';
      default:
        return error.response.data?.message || translate('errors.unknownError') || 'An error occurred. Please try again.';
    }
  }

  // Backend error messages
  if (error.response?.data?.message) {
    const message = error.response.data.message;
    
    // Common error patterns
    if (message.includes('validation')) {
      return translate('errors.validationError') || 'Please check your input and try again.';
    }
    if (message.includes('not found')) {
      return translate('errors.notFound') || 'The requested resource was not found.';
    }
    if (message.includes('unauthorized') || message.includes('authentication')) {
      return translate('errors.unauthorized') || 'Please login to continue.';
    }
    if (message.includes('already exists') || message.includes('duplicate')) {
      return translate('errors.alreadyExists') || 'This resource already exists.';
    }
    
    return message;
  }

  // Handle validation errors object
  if (error.response?.data?.errors || error.response?.data?.validationErrors) {
    const errors = error.response.data.errors || error.response.data.validationErrors;
    if (typeof errors === 'object') {
      const firstError = Object.values(errors)[0];
      if (Array.isArray(firstError) && firstError.length > 0) {
        return String(firstError[0]);
      }
      if (typeof firstError === 'string') {
        return firstError;
      }
    }
  }

  // Generic error message
  if (error.message) {
    return error.message;
  }

  return translate('errors.unknownError') || 'An unexpected error occurred. Please try again.';
}

/**
 * Get field-specific error message
 */
export function getFieldError(fieldName: string, errors: any, t?: (key: string) => string): string | null {
  const translate = t || ((key: string) => key);
  
  if (!errors) return null;

  // Check direct field error
  if (errors[fieldName]) {
    if (typeof errors[fieldName] === 'string') {
      return errors[fieldName];
    }
    if (Array.isArray(errors[fieldName]) && errors[fieldName].length > 0) {
      return errors[fieldName][0];
    }
  }

  // Check nested field errors (e.g., "profile.name")
  const nestedKey = Object.keys(errors).find(key => key.endsWith(`.${fieldName}`) || key.includes(fieldName));
  if (nestedKey && errors[nestedKey]) {
    if (typeof errors[nestedKey] === 'string') {
      return errors[nestedKey];
    }
    if (Array.isArray(errors[nestedKey]) && errors[nestedKey].length > 0) {
      return errors[nestedKey][0];
    }
  }

  return null;
}

/**
 * Extract validation errors from API error response
 * Useful for form validation error handling
 */
export function extractValidationErrors(error: any): Record<string, string> {
  const validationErrors: Record<string, string> = {};
  
  if (!error?.response?.data) {
    return validationErrors;
  }

  const { errors, validationErrors: valErrors } = error.response.data;
  const errorData = errors || valErrors;

  if (!errorData) {
    return validationErrors;
  }

  // Handle Zod validation errors (array format)
  if (Array.isArray(errorData)) {
    errorData.forEach((err: any) => {
      if (err.path && err.path.length > 0) {
        const fieldName = err.path[err.path.length - 1];
        validationErrors[fieldName] = err.message || 'Invalid value';
      }
    });
  } 
  // Handle object format
  else if (typeof errorData === 'object') {
    Object.keys(errorData).forEach((key) => {
      const errorValue = errorData[key];
      if (typeof errorValue === 'string') {
        validationErrors[key] = errorValue;
      } else if (Array.isArray(errorValue) && errorValue.length > 0) {
        validationErrors[key] = String(errorValue[0]);
      } else if (errorValue?.message) {
        validationErrors[key] = String(errorValue.message);
      }
    });
  }

  return validationErrors;
}

