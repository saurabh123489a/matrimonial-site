/**
 * Form validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email address
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
}

/**
 * Validate phone number (Indian format)
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove spaces and special characters
  const cleaned = phone.replace(/[\s-()]/g, '');
  
  // Check if it's a valid Indian phone number (10 digits, optionally with +91)
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
  if (!phoneRegex.test(cleaned)) {
    return { isValid: false, error: 'Please enter a valid 10-digit phone number' };
  }

  return { isValid: true };
}

/**
 * Validate required field
 */
export function validateRequired(value: string | number | null | undefined, fieldName: string = 'Field'): ValidationResult {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
}

/**
 * Validate minimum length
 */
export function validateMinLength(value: string, minLength: number, fieldName: string = 'Field'): ValidationResult {
  if (!value || value.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }
  return { isValid: true };
}

/**
 * Validate maximum length
 */
export function validateMaxLength(value: string, maxLength: number, fieldName: string = 'Field'): ValidationResult {
  if (value && value.length > maxLength) {
    return { isValid: false, error: `${fieldName} must be no more than ${maxLength} characters` };
  }
  return { isValid: true };
}

/**
 * Validate age range
 */
export function validateAge(age: number): ValidationResult {
  if (!age || age < 18) {
    return { isValid: false, error: 'Age must be at least 18' };
  }
  if (age > 100) {
    return { isValid: false, error: 'Please enter a valid age' };
  }
  return { isValid: true };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }
  return { isValid: true };
}

/**
 * Validate URL
 */
export function validateUrl(url: string): ValidationResult {
  if (!url || url.trim() === '') {
    return { isValid: false, error: 'URL is required' };
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
}

/**
 * Validate Gahoi ID (5 digits, starting with 1000)
 */
export function validateGahoiId(id: string): ValidationResult {
  if (!id || id.trim() === '') {
    return { isValid: false, error: 'Gahoi ID is required' };
  }

  const idRegex = /^[1-9]\d{4}$/;
  if (!idRegex.test(id)) {
    return { isValid: false, error: 'Gahoi ID must be a 5-digit number starting from 1000' };
  }

  const numId = parseInt(id, 10);
  if (numId < 1000) {
    return { isValid: false, error: 'Gahoi ID must be at least 1000' };
  }

  return { isValid: true };
}

