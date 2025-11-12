/**
 * Input sanitization utilities to prevent XSS attacks
 */

/**
 * Sanitize HTML string by escaping special characters
 */
export function sanitizeHtml(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Sanitize user input for display
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Sanitize text for safe display (removes HTML tags)
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  const div = document.createElement('div');
  div.innerHTML = text;
  return div.textContent || div.innerText || '';
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitize phone number (keep only digits and +)
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  // Basic email validation and sanitization
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitized = email.trim().toLowerCase();
  return emailRegex.test(sanitized) ? sanitized : '';
}

