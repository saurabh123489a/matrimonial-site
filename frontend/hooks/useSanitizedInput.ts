import { sanitizeInput, sanitizeEmail, sanitizePhone, sanitizeText } from '@/lib/utils/sanitize';

/**
 * Utility functions for sanitizing form inputs
 */

/**
 * Sanitize input value based on input type
 */
export function sanitizeFormInput(value: string, type: 'text' | 'email' | 'phone' | 'textarea' = 'text'): string {
  switch (type) {
    case 'email':
      return sanitizeEmail(value);
    case 'phone':
      return sanitizePhone(value);
    case 'textarea':
      return sanitizeText(value);
    default:
      return sanitizeInput(value);
  }
}

/**
 * Create a sanitized onChange handler for form inputs
 */
export function createSanitizedHandler(
  setValue: (value: string) => void,
  type: 'text' | 'email' | 'phone' | 'textarea' = 'text'
) {
  return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const sanitized = sanitizeFormInput(e.target.value, type);
    setValue(sanitized);
  };
}

