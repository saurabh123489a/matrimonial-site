'use client';

import React from 'react';

export interface SpacingProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  horizontal?: boolean;
}

export const Spacing: React.FC<SpacingProps> = ({ size = 'md', horizontal = false }) => {
  const sizeMap = {
    xs: horizontal ? 'w-1' : 'h-1',
    sm: horizontal ? 'w-2' : 'h-2',
    md: horizontal ? 'w-4' : 'h-4',
    lg: horizontal ? 'w-6' : 'h-6',
    xl: horizontal ? 'w-8' : 'h-8',
    '2xl': horizontal ? 'w-12' : 'h-12',
  };
  
  return <div className={sizeMap[size]} />;
};

export default Spacing;

