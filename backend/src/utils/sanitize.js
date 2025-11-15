/**
 * Input Sanitization Utilities
 * Protects against XSS attacks and malicious input
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 * Removes potentially dangerous HTML tags and attributes
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeHtml(input) {
  if (typeof input !== 'string') {
    return input;
  }

  // Remove script tags and event handlers
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '');
}

/**
 * Sanitize text content (removes HTML tags)
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string with HTML tags removed
 */
export function sanitizeText(input) {
  if (typeof input !== 'string') {
    return input;
  }

  // Remove all HTML tags
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize user input for safe storage
 * Escapes special characters and removes dangerous content
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }

  // First remove HTML tags
  let sanitized = sanitizeText(input);
  
  // Escape special characters that could be used in injection attacks
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  return sanitized;
}

/**
 * Sanitize an object recursively
 * @param {Object} obj - Object to sanitize
 * @param {Object} options - Sanitization options
 * @param {boolean} options.preserveHtml - If true, only removes dangerous HTML (default: false)
 * @returns {Object} Sanitized object
 */
export function sanitizeObject(obj, options = {}) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const { preserveHtml = false } = options;
  const sanitized = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      if (typeof value === 'string') {
        sanitized[key] = preserveHtml ? sanitizeHtml(value) : sanitizeInput(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value, options);
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
}

/**
 * Sanitize message content (allows some formatting but removes dangerous content)
 * @param {string} content - Message content
 * @returns {string} Sanitized message content
 */
export function sanitizeMessageContent(content) {
  if (typeof content !== 'string') {
    return '';
  }

  // Remove script tags and event handlers
  let sanitized = sanitizeHtml(content);
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Limit length (already enforced by schema, but good to have here too)
  if (sanitized.length > 5000) {
    sanitized = sanitized.substring(0, 5000);
  }

  return sanitized;
}

