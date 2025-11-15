'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface ReadReceiptProps {
  isRead: boolean;
  readAt?: string;
  sentAt: string;
  isMyMessage: boolean;
}

export default function ReadReceipt({ isRead, readAt, sentAt, isMyMessage }: ReadReceiptProps) {
  const { t, language } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(false);

  // Only show read receipt for messages sent by current user
  if (!isMyMessage) {
    return null;
  }

  const formatReadTime = (readAtString: string) => {
    const readDate = new Date(readAtString);
    const now = new Date();
    const diffMs = now.getTime() - readDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return t('messages.readJustNow') || 'Read just now';
    }
    if (diffMins < 60) {
      const plural = diffMins > 1 ? 's' : '';
      return t('messages.readMinutesAgo', { mins: diffMins, plural }) || `Read ${diffMins} minute${plural} ago`;
    }
    if (diffHours < 24) {
      const plural = diffHours > 1 ? 's' : '';
      return t('messages.readHoursAgo', { hours: diffHours, plural }) || `Read ${diffHours} hour${plural} ago`;
    }
    if (diffDays < 7) {
      const plural = diffDays > 1 ? 's' : '';
      return t('messages.readDaysAgo', { days: diffDays, plural }) || `Read ${diffDays} day${plural} ago`;
    }
    
    // Show exact date for older messages
    return readDate.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: readDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Determine receipt state
  let receiptState: 'sent' | 'delivered' | 'read';
  if (readAt) {
    receiptState = 'read';
  } else if (isRead) {
    receiptState = 'delivered';
  } else {
    receiptState = 'sent';
  }

  return (
    <span
      className="inline-flex items-center ml-1 relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      aria-label={
        receiptState === 'read' && readAt
          ? `Read ${formatReadTime(readAt)}`
          : receiptState === 'delivered'
          ? 'Delivered'
          : 'Sent'
      }
    >
      {/* Single checkmark for sent */}
      {receiptState === 'sent' && (
        <span className="text-gray-400 text-xs" aria-hidden="true">
          ✓
        </span>
      )}

      {/* Double checkmark for delivered */}
      {receiptState === 'delivered' && (
        <span className="text-gray-400 text-xs" aria-hidden="true">
          ✓✓
        </span>
      )}

      {/* Double checkmark (blue) for read */}
      {receiptState === 'read' && (
        <span className="text-blue-500 text-xs transition-colors duration-200" aria-hidden="true">
          ✓✓
        </span>
      )}

      {/* Tooltip showing read time */}
      {showTooltip && receiptState === 'read' && readAt && (
        <div
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap z-10"
          role="tooltip"
        >
          {formatReadTime(readAt)}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </span>
  );
}

