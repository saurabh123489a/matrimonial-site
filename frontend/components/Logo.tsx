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

  // Modern Elegant Logo Icon - Stylized "e" with heart accent
  const LogoIcon = () => (
    <div className={`${currentSize.icon} relative flex items-center justify-center`}>
      <svg 
        className="w-full h-full flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
        viewBox="0 0 56 56" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Background circle */}
        <circle 
          cx="28" 
          cy="28" 
          r="26" 
          fill="url(#logoGradient)"
          className="opacity-10 dark:opacity-20"
        />
        {/* Stylized "e" letter */}
        <path 
          d="M28 12C20 12 14 18 14 26C14 30 16 33 19 35C17 37 16 40 16 43C16 47 19 50 23 50C25 50 27 49 28 48V44C27 45 25 45 23 45C21 45 19 43 19 41C19 39 20 37 22 36C20 35 18 32 18 28C18 22 22 18 28 18C34 18 38 22 38 28C38 30 37 32 36 33C38 34 40 37 40 41C40 43 38 45 36 45C34 45 32 44 31 43V47C32 48 34 49 36 49C40 49 43 46 43 42C43 39 42 36 40 34C42 32 44 29 44 25C44 19 38 13 28 13Z" 
          fill="url(#logoGradient)"
          className="group-hover:opacity-90 transition-opacity"
        />
        {/* Small heart accent */}
        <path 
          d="M28 38C27 37 25 35 24 33C24 31 25 29 27 29C28 29 28.5 29.5 29 30C29.5 29.5 30 29 31 29C33 29 34 31 34 33C34 35 32 37 31 38C30.5 38.5 28.5 38.5 28 38Z" 
          fill="url(#logoGradient)"
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#db2777" />
            <stop offset="50%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#db2777" />
          </linearGradient>
          <style>{`
            @media (prefers-color-scheme: dark) {
              #logoGradient stop:nth-child(1),
              #logoGradient stop:nth-child(3) { stop-color: #f472b6; }
              #logoGradient stop:nth-child(2) { stop-color: #c084fc; }
            }
          `}</style>
        </defs>
      </svg>
    </div>
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
        <span className={`font-semibold tracking-wide bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-pink-400 dark:via-purple-400 dark:to-pink-400 ${currentSize.text} transition-all duration-300`}>
          {t('common.appName')}
        </span>
      )}
    </Link>
  );
}

