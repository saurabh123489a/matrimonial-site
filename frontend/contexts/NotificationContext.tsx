'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import ToastNotification from '@/components/ToastNotification';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
}

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification: Notification = {
      id,
      duration: notification.duration ?? 5000,
      ...notification,
    };
    setNotifications((prev) => [...prev, newNotification]);
  }, []);

  const showSuccess = useCallback(
    (message: string, title?: string) => {
      showNotification({ type: 'success', message, title });
    },
    [showNotification]
  );

  const showError = useCallback(
    (message: string, title?: string) => {
      showNotification({ type: 'error', message, title });
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (message: string, title?: string) => {
      showNotification({ type: 'info', message, title });
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (message: string, title?: string) => {
      showNotification({ type: 'warning', message, title });
    },
    [showNotification]
  );

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        showSuccess,
        showError,
        showInfo,
        showWarning,
      }}
    >
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-3 w-full max-w-sm px-4 sm:px-0">
        {notifications.map((notification) => (
          <ToastNotification
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

