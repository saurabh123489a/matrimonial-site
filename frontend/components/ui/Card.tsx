'use client';

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      padding = 'md',
      hover = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = 'bg-[var(--bg-secondary)] rounded-xl transition-all duration-200';
    
    const variantStyles = {
      default: 'border border-[var(--border)] shadow-sm',
      elevated: 'shadow-lg hover:shadow-xl',
      outlined: 'border-2 border-[var(--border-dark)]',
      flat: 'border-0 shadow-none',
    };
    
    const paddingStyles = {
      none: '',
      sm: 'p-3',
      md: 'p-4 sm:p-5',
      lg: 'p-6 sm:p-8',
    };
    
    const hoverStyles = hover ? 'hover:shadow-md cursor-pointer' : '';
    
    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;

