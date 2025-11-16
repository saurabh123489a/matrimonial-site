'use client';

import React from 'react';
import Link from 'next/link';
import { ButtonProps } from './Button';

export interface LinkButtonProps extends Omit<ButtonProps, 'href' | 'onClick'> {
  href: string;
  external?: boolean;
}

const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  (
    {
      href,
      external = false,
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      leftIcon,
      rightIcon,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variantStyles = {
      primary: 'bg-[var(--primary)] text-[var(--text-inverse)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] focus:ring-[var(--primary)] shadow-md hover:shadow-lg',
      secondary: 'bg-[var(--accent)] text-[var(--text-inverse)] hover:bg-[var(--accent-hover)] focus:ring-[var(--accent)] shadow-md hover:shadow-lg',
      outline: 'border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--text-inverse)] focus:ring-[var(--primary)]',
      ghost: 'text-[var(--primary)] hover:bg-[var(--bg-hover)] focus:ring-[var(--primary)]',
      danger: 'bg-[var(--error)] text-white hover:bg-red-600 focus:ring-[var(--error)] shadow-md hover:shadow-lg',
    };
    
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2.5 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-2.5',
    };
    
    const widthStyles = fullWidth ? 'w-full' : '';
    const linkClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`;

    if (external) {
      return (
        <a
          href={href}
          ref={ref}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
          {...props as any}
        >
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </a>
      );
    }

    return (
      <Link
        href={href}
        ref={ref}
        className={linkClassName}
        {...props as any}
      >
        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </Link>
    );
  }
);

LinkButton.displayName = 'LinkButton';

export default LinkButton;

