import webpush from 'web-push';
import { pushSubscriptionRepository } from '../repositories/pushSubscriptionRepository.js';

// Initialize web-push with VAPID keys
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@matrimonial.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
}

export const pushNotificationService = {
  /**
   * Get VAPID public key for frontend
   */
  getVapidPublicKey() {
    return vapidPublicKey;
  },

  /**
   * Send push notification to a single subscription
   */
  async sendPushNotification(subscription, payload) {
    try {
      const result = await webpush.sendNotification(subscription, JSON.stringify(payload));
      return { success: true, result };
    } catch (error) {
      // Handle expired/invalid subscriptions
      if (error.statusCode === 410 || error.statusCode === 404) {
        // Subscription expired or not found
        await pushSubscriptionRepository.deleteByEndpoint(subscription.endpoint);
        return { success: false, error: 'Subscription expired', expired: true };
      }
      return { success: false, error: error.message };
    }
  },

  /**
   * Send push notification to a user (all their active subscriptions)
   */
  async sendPushToUser(userId, payload) {
    const subscriptions = await pushSubscriptionRepository.findByUserId(userId);
    
    if (subscriptions.length === 0) {
      return { sent: 0, failed: 0, errors: [] };
    }

    const results = await Promise.allSettled(
      subscriptions.map(sub => {
        const subscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth,
          },
        };
        return this.sendPushNotification(subscription, payload);
      })
    );

    const sent = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - sent;
    const errors = results
      .filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success))
      .map(r => r.status === 'rejected' ? r.reason : r.value.error);

    return { sent, failed, errors };
  },

  /**
   * Send push notification to multiple users
   */
  async sendPushToUsers(userIds, payload) {
    const results = await Promise.allSettled(
      userIds.map(userId => this.sendPushToUser(userId, payload))
    );

    const totalSent = results.reduce((sum, r) => {
      if (r.status === 'fulfilled') {
        return sum + r.value.sent;
      }
      return sum;
    }, 0);

    const totalFailed = results.reduce((sum, r) => {
      if (r.status === 'fulfilled') {
        return sum + r.value.failed;
      }
      return sum + 1;
    }, 0);

    return { sent: totalSent, failed: totalFailed };
  },

  /**
   * Create notification payload
   */
  createNotificationPayload(title, body, options = {}) {
    const {
      icon = '/icon-192x192.png',
      badge = '/icon-192x192.png',
      image,
      url,
      tag,
      requireInteraction = false,
      silent = false,
      data = {},
    } = options;

    return {
      title,
      body,
      icon,
      badge,
      image,
      tag,
      requireInteraction,
      silent,
      data: {
        ...data,
        url: url || '/notifications',
        timestamp: Date.now(),
      },
    };
  },

  /**
   * Send notification push when a notification is created
   */
  async sendNotificationPush(userId, notification) {
    const payload = this.createNotificationPayload(
      notification.title,
      notification.message,
      {
        icon: notification.relatedUserId?.photos?.[0]?.url || '/icon-192x192.png',
        url: this.getNotificationUrl(notification),
        tag: notification.type,
        data: {
          notificationId: notification._id.toString(),
          type: notification.type,
          relatedUserId: notification.relatedUserId?.toString(),
        },
      }
    );

    return await this.sendPushToUser(userId, payload);
  },

  /**
   * Get notification URL based on type
   */
  getNotificationUrl(notification) {
    // Handle both populated and non-populated relatedUserId
    const relatedUserId = notification.relatedUserId?._id 
      ? notification.relatedUserId._id.toString()
      : notification.relatedUserId?.toString();

    switch (notification.type) {
      case 'message_received':
        return relatedUserId ? `/messages/${relatedUserId}` : '/messages';
      case 'interest_received':
      case 'interest_accepted':
        return relatedUserId ? `/profiles/${relatedUserId}` : '/profiles';
      case 'profile_view':
        return '/profile-views';
      case 'shortlist':
        return relatedUserId ? `/profiles/${relatedUserId}` : '/profiles';
      case 'admin':
        return '/notifications';
      default:
        return '/notifications';
    }
  },
};

