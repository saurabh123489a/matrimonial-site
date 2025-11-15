import { pushSubscriptionRepository } from '../repositories/pushSubscriptionRepository.js';

export const pushSubscriptionService = {
  /**
   * Subscribe user to push notifications
   */
  async subscribe(userId, subscription, metadata = {}) {
    const { userAgent, device } = metadata;

    // Check if subscription already exists
    const existing = await pushSubscriptionRepository.findByEndpoint(subscription.endpoint);

    if (existing) {
      // Update existing subscription
      return await pushSubscriptionRepository.updateByEndpoint(subscription.endpoint, {
        userId,
        keys: subscription.keys,
        userAgent,
        device,
        isActive: true,
      });
    }

    // Create new subscription
    return await pushSubscriptionRepository.create({
      userId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      userAgent,
      device,
      isActive: true,
    });
  },

  /**
   * Unsubscribe user from push notifications
   */
  async unsubscribe(userId, endpoint) {
    const subscription = await pushSubscriptionRepository.findByEndpoint(endpoint);

    if (!subscription) {
      return null;
    }

    // Verify ownership
    if (subscription.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized');
    }

    return await pushSubscriptionRepository.deleteByEndpoint(endpoint);
  },

  /**
   * Get all subscriptions for a user
   */
  async getUserSubscriptions(userId) {
    return await pushSubscriptionRepository.findByUserId(userId);
  },

  /**
   * Deactivate all subscriptions for a user (e.g., on logout)
   */
  async deactivateUserSubscriptions(userId) {
    return await pushSubscriptionRepository.deactivateByUserId(userId);
  },
};

