'use client';

import { useTranslation } from '@/hooks/useTranslation';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
  showWelcomeMessage?: boolean;
}

export default function LoadingSpinner({ 
  size = 'md', 
  className = '',
  text,
  showWelcomeMessage = false
}: LoadingSpinnerProps) {
  const { t } = useTranslation();
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const displayText = text || (showWelcomeMessage ? t('common.loadingMessage') : t('common.loading'));

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-b-2 border-pink-600 dark:border-red-500`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
      {displayText && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 text-center">{displayText}</p>
      )}
    </div>
  );
}

