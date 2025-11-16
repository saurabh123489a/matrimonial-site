'use client';

import React from 'react';

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'small' | 'caption';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  color?: 'primary' | 'secondary' | 'muted' | 'inverse';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  (
    {
      children,
      variant = 'body',
      as,
      color = 'primary',
      weight = 'normal',
      align = 'left',
      className = '',
      ...props
    },
    ref
  ) => {
    const variantMap = {
      h1: { tag: 'h1', styles: 'text-3xl sm:text-4xl lg:text-5xl font-bold' },
      h2: { tag: 'h2', styles: 'text-2xl sm:text-3xl lg:text-4xl font-bold' },
      h3: { tag: 'h3', styles: 'text-xl sm:text-2xl lg:text-3xl font-semibold' },
      h4: { tag: 'h4', styles: 'text-lg sm:text-xl lg:text-2xl font-semibold' },
      h5: { tag: 'h5', styles: 'text-base sm:text-lg font-medium' },
      h6: { tag: 'h6', styles: 'text-sm sm:text-base font-medium' },
      body: { tag: 'p', styles: 'text-sm sm:text-base' },
      small: { tag: 'p', styles: 'text-xs sm:text-sm' },
      caption: { tag: 'span', styles: 'text-xs' },
    };
    
    const colorMap = {
      primary: 'text-[var(--text-primary)]',
      secondary: 'text-[var(--text-secondary)]',
      muted: 'text-[var(--text-muted)]',
      inverse: 'text-[var(--text-inverse)]',
    };
    
    const weightMap = {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    };
    
    const alignMap = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    };
    
    const { tag: defaultTag, styles: variantStyles } = variantMap[variant];
    const Tag = (as || defaultTag) as React.ElementType;
    
    return (
      <Tag
        ref={ref as any}
        className={`${variantStyles} ${colorMap[color]} ${weightMap[weight]} ${alignMap[align]} ${className}`}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);

Typography.displayName = 'Typography';

export default Typography;

