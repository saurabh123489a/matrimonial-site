'use client';

import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = 'default',
      size = 'md',
      dot = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center font-medium rounded-full';
    
    const variantStyles = {
      default: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]',
      primary: 'bg-[var(--primary)] text-[var(--text-inverse)]',
      accent: 'bg-[var(--accent)] text-[var(--text-inverse)]',
      success: 'bg-[var(--success-bg)] text-[var(--success-text)]',
      warning: 'bg-[var(--warning-bg)] text-[var(--warning-text)]',
      error: 'bg-[var(--error-bg)] text-[var(--error-text)]',
      info: 'bg-[var(--info-bg)] text-[var(--info-text)]',
    };
    
    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs gap-1',
      md: 'px-2.5 py-1 text-xs gap-1.5',
      lg: 'px-3 py-1.5 text-sm gap-2',
    };
    
    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {dot && (
          <span className={`w-1.5 h-1.5 rounded-full ${
            variant === 'default' ? 'bg-[var(--text-secondary)]' : 'bg-current'
          }`} />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;

