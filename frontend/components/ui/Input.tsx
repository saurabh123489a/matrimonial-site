'use client';

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;
    
    const baseStyles = 'block w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 text-sm sm:text-base';
    const stateStyles = hasError
      ? 'border-[var(--error)] bg-[var(--error-bg)] focus:ring-[var(--error)] focus:border-[var(--error)]'
      : 'border-[var(--border)] bg-[var(--bg-input)] focus:ring-[var(--primary)] focus:border-[var(--border-focus)] hover:border-[var(--border-dark)]';
    
    const iconPadding = leftIcon ? 'pl-10 sm:pl-12' : 'pl-3 sm:pl-4';
    const iconPaddingRight = rightIcon ? 'pr-10 sm:pr-12' : 'pr-3 sm:pr-4';
    const widthStyles = fullWidth ? 'w-full' : '';
    
    return (
      <div className={widthStyles}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-[var(--text-primary)] mb-2"
          >
            {label}
            {props.required && <span className="text-[var(--error)] ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none z-10 text-[var(--text-muted)]">
              <div className="h-4 w-4 sm:h-5 sm:w-5">{leftIcon}</div>
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`${baseStyles} ${stateStyles} ${iconPadding} ${iconPaddingRight} ${className}`}
            aria-invalid={hasError}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center pointer-events-none z-10 text-[var(--text-muted)]">
              <div className="h-4 w-4 sm:h-5 sm:w-5">{rightIcon}</div>
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-[var(--error)] flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-[var(--text-muted)]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

