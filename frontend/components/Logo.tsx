'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'minimal';
}

export default function Logo({ 
  className = '', 
  showText = true, 
  size = 'md',
  variant = 'default'
}: LogoProps) {
  const { t } = useTranslation();
  
  const sizeClasses = {
    sm: {
      icon: 'w-6 h-6 sm:w-7 sm:h-7',
      text: 'text-base sm:text-lg',
      container: 'gap-1.5 sm:gap-2'
    },
    md: {
      icon: 'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9',
      text: 'text-lg sm:text-xl md:text-2xl',
      container: 'gap-2 sm:gap-2.5'
    },
    lg: {
      icon: 'w-10 h-10 sm:w-12 sm:h-12',
      text: 'text-2xl sm:text-3xl md:text-4xl',
      container: 'gap-3 sm:gap-4'
    },
    xl: {
      icon: 'w-12 h-12 sm:w-16 sm:h-16',
      text: 'text-3xl sm:text-4xl md:text-5xl',
      container: 'gap-4 sm:gap-5'
    }
  };

  const currentSize = sizeClasses[size];

  // Simple emoji icon (original design)
  const LogoIcon = () => (
    <span className={`${currentSize.icon} flex-shrink-0 text-2xl sm:text-3xl md:text-4xl transition-transform duration-300 group-hover:scale-110`}>
      💍
    </span>
  );

  // Minimal variant - just icon
  if (variant === 'minimal' || !showText) {
    return (
      <Link 
        href="/" 
        className={`inline-flex items-center justify-center group ${className}`}
        aria-label={`${t('common.appName')} - Home`}
      >
        <LogoIcon />
      </Link>
    );
  }

  return (
    <Link 
      href="/" 
      className={`inline-flex items-center group transition-all duration-300 hover:opacity-90 ${currentSize.container} ${className}`}
      aria-label={`${t('common.appName')} - Home`}
    >
      <LogoIcon />
      {showText && (
        <span className={`font-light tracking-tight text-gray-900 ${currentSize.text}`}>
          {t('common.appName')}
        </span>
      )}
    </Link>
  );
}

