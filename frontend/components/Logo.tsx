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

  // Custom Ring Icon SVG
  const RingIcon = () => (
    <svg 
      className={`${currentSize.icon} flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer Ring */}
      <circle 
        cx="32" 
        cy="32" 
        r="28" 
        stroke="currentColor" 
        strokeWidth="2.5"
        fill="none"
        className="text-pink-500 dark:text-pink-400"
      />
      {/* Inner Ring */}
      <circle 
        cx="32" 
        cy="32" 
        r="20" 
        stroke="currentColor" 
        strokeWidth="2"
        fill="none"
        className="text-purple-500 dark:text-purple-400"
        strokeDasharray="4 2"
      />
      {/* Center Gem/Diamond */}
      <path 
        d="M32 18 L38 28 L32 38 L26 28 Z" 
        fill="currentColor"
        className="text-pink-600 dark:text-pink-500"
      />
      {/* Sparkle effect */}
      <circle 
        cx="32" 
        cy="12" 
        r="1.5" 
        fill="currentColor"
        className="text-pink-400 dark:text-pink-300"
      />
      <circle 
        cx="32" 
        cy="52" 
        r="1.5" 
        fill="currentColor"
        className="text-purple-400 dark:text-purple-300"
      />
      <circle 
        cx="12" 
        cy="32" 
        r="1.5" 
        fill="currentColor"
        className="text-pink-400 dark:text-pink-300"
      />
      <circle 
        cx="52" 
        cy="32" 
        r="1.5" 
        fill="currentColor"
        className="text-purple-400 dark:text-purple-300"
      />
    </svg>
  );

  // Minimal variant - just icon
  if (variant === 'minimal' || !showText) {
    return (
      <Link 
        href="/" 
        className={`inline-flex items-center justify-center group ${className}`}
        aria-label={`${t('common.appName')} - Home`}
      >
        <RingIcon />
      </Link>
    );
  }

  return (
    <Link 
      href="/" 
      className={`inline-flex items-center group transition-all duration-300 hover:opacity-90 ${currentSize.container} ${className}`}
      aria-label={`${t('common.appName')} - Home`}
    >
      <RingIcon />
      {showText && (
        <span className={`font-bold tracking-tight bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-pink-400 dark:via-purple-400 dark:to-pink-400 ${currentSize.text} transition-all duration-300 group-hover:scale-105`}>
          {t('common.appName')}
        </span>
      )}
    </Link>
  );
}

