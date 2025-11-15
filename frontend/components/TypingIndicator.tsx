'use client';

import { useTranslation } from '@/hooks/useTranslation';

interface TypingIndicatorProps {
  userName: string;
  isVisible: boolean;
}

export default function TypingIndicator({ userName, isVisible }: TypingIndicatorProps) {
  const { t } = useTranslation();

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="flex items-center gap-2 px-4 py-2 transition-opacity duration-300 opacity-100"
      role="status"
      aria-live="polite"
      aria-label={`${userName} is typing`}
    >
      <div className="flex gap-1 px-3 py-2 bg-gray-100 rounded-lg">
        {/* Animated bouncing dots */}
        <span className="flex gap-1 items-center">
          <span
            className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
            style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
            aria-hidden="true"
          />
          <span
            className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
            style={{ animationDelay: '200ms', animationDuration: '1.4s' }}
            aria-hidden="true"
          />
          <span
            className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
            style={{ animationDelay: '400ms', animationDuration: '1.4s' }}
            aria-hidden="true"
          />
        </span>
      </div>
      <span className="text-sm text-gray-600">
        {t('messages.typing', { name: userName }) || `${userName} is typing...`}
      </span>
    </div>
  );
}

