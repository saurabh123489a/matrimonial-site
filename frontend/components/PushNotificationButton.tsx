'use client';

import { useState, useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { auth } from '@/lib/auth';

export default function PushNotificationButton() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  } = usePushNotifications();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(auth.isAuthenticated());
  }, []);

  if (!isSupported) {
    return (
      <div className="text-sm sm:text-sm text-gray-500">
        Push notifications are not supported in this browser
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-sm sm:text-sm text-gray-500">
        Please login to enable push notifications
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="text-sm sm:text-sm text-red-600">
        Notification permission denied. Please enable it in your browser settings.
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-sm font-semibold sm:font-medium text-gray-900">
            Push Notifications
          </h3>
          <p className="text-xs sm:text-xs text-gray-600">
            {isSubscribed
              ? 'You will receive push notifications for new messages and activities'
              : 'Enable to receive push notifications for new messages and activities'}
          </p>
        </div>
        <button
          onClick={() => {
            if (isSubscribed) {
              unsubscribe();
            } else {
              subscribe();
            }
          }}
          disabled={isLoading || (permission as NotificationPermission) === 'denied'}
          className={`w-full sm:w-auto px-4 sm:px-4 py-2.5 sm:py-2 text-sm font-medium rounded-lg transition-colors touch-manipulation min-h-[44px] sm:min-h-0 flex items-center justify-center gap-2 ${
            isSubscribed
              ? 'bg-gray-200'
              : 'bg-pink-600 text-white hover:bg-pink-700 active:bg-pink-800'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label={isSubscribed ? 'Disable push notifications' : 'Enable push notifications'}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="hidden sm:inline">{isSubscribed ? 'Disabling...' : 'Enabling...'}</span>
              <span className="sm:hidden">{isSubscribed ? 'Disabling' : 'Enabling'}</span>
            </>
          ) : isSubscribed ? (
            <>
              <span className="hidden sm:inline">Disable</span>
              <span className="sm:hidden">Disable Notifications</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Enable</span>
              <span className="sm:hidden">Enable Notifications</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

