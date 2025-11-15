'use client';

import { useState, useEffect, useCallback } from 'react';
import { pushNotificationManager, PushSubscriptionData } from '@/lib/pushNotifications';
import { pushApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useNotifications } from '@/contexts/NotificationContext';

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useNotifications();

  useEffect(() => {
    // Check if push notifications are supported
    setIsSupported(pushNotificationManager.isSupported());
    
    // Get current permission status
    if (pushNotificationManager.isSupported()) {
      setPermission(pushNotificationManager.getPermissionStatus());
      checkSubscriptionStatus();
    }
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const subscribed = await pushNotificationManager.isSubscribed();
      setIsSubscribed(subscribed);
    } catch (err) {
      console.error('Error checking subscription:', err);
    }
  };

  const subscribe = useCallback(async () => {
    if (!auth.isAuthenticated()) {
      showError('Please login to enable push notifications');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Request permission
      const permissionStatus = await pushNotificationManager.requestPermission();
      setPermission(permissionStatus);

      if (permissionStatus !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Subscribe to push
      const subscription = await pushNotificationManager.subscribe();
      
      if (!subscription) {
        throw new Error('Failed to create subscription');
      }

      // Send subscription to server
      const userAgent = navigator.userAgent;
      const device = /Mobile|Android|iPhone|iPad/.test(userAgent) ? 'mobile' : 'desktop';
      
      const response = await pushApi.subscribe(subscription, userAgent, device);
      
      if (response.status) {
        setIsSubscribed(true);
        showSuccess('Push notifications enabled successfully!');
        return true;
      } else {
        throw new Error(response.message || 'Failed to save subscription');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to enable push notifications';
      setError(errorMessage);
      showError(errorMessage);
      
      // Try to unsubscribe locally if server subscription failed
      try {
        await pushNotificationManager.unsubscribe();
      } catch (unsubError) {
        // Ignore unsubscribe errors
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showSuccess, showError]);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get current subscription
      const subscription = await pushNotificationManager.getSubscription();
      
      if (subscription) {
        // Unsubscribe from server
        await pushApi.unsubscribe(subscription.endpoint);
      }

      // Unsubscribe locally
      await pushNotificationManager.unsubscribe();
      
      setIsSubscribed(false);
      showSuccess('Push notifications disabled');
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to disable push notifications';
      setError(errorMessage);
      showError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showSuccess, showError]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    checkSubscriptionStatus,
  };
}

