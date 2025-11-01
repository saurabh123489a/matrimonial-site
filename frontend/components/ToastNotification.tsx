'use client';

import { useEffect, useState } from 'react';
import { Notification } from '@/contexts/NotificationContext';
import { useTranslation } from '@/hooks/useTranslation';

interface ToastNotificationProps {
  notification: Notification;
  onClose: () => void;
}

export default function ToastNotification({ notification, onClose }: ToastNotificationProps) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger slide-in animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto-close after duration
    const timer = setTimeout(() => {
      handleClose();
    }, notification.duration || 5000);

    return () => clearTimeout(timer);
  }, [notification.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };

  const getNotificationStyles = () => {
    const baseStyles = 'bg-white rounded-lg shadow-2xl border-l-4 p-4 mb-3 flex items-start gap-3';
    
    switch (notification.type) {
      case 'success':
        return `${baseStyles} border-green-500`;
      case 'error':
        return `${baseStyles} border-red-500`;
      case 'info':
        return `${baseStyles} border-blue-500`;
      case 'warning':
        return `${baseStyles} border-yellow-500`;
      default:
        return `${baseStyles} border-gray-500`;
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      case 'warning':
        return '⚠️';
      default:
        return '📢';
    }
  };

  const getTitle = () => {
    if (notification.title) return notification.title;
    
    switch (notification.type) {
      case 'success':
        return t('notifications.toast.success');
      case 'error':
        return t('notifications.toast.error');
      case 'info':
        return t('notifications.toast.info');
      case 'warning':
        return t('notifications.toast.warning');
      default:
        return t('notifications.toast.notification');
    }
  };

  return (
    <div
      className={`${getNotificationStyles()} transform transition-all duration-300 ease-in-out ${
        isVisible && !isExiting
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      } max-w-full sm:max-w-sm`}
      role="alert"
      aria-live="polite"
    >
      <div className="text-2xl flex-shrink-0">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-gray-900 mb-1">{getTitle()}</h4>
        <p className="text-sm text-gray-700" dir="auto">
          {notification.message}
        </p>
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label={t('common.close')}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

