import { notificationRepository } from '../repositories/notificationRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { pushNotificationService } from './pushNotificationService.js';

export const notificationService = {
  /**
   * Get notifications for a user
   */
  async getNotifications(userId, options = {}) {
    return await notificationRepository.findByUser(userId, options);
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId) {
    return await notificationRepository.getUnreadCount(userId);
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    return await notificationRepository.markAsRead(notificationId, userId);
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    return await notificationRepository.markAllAsRead(userId);
  },

  /**
   * Delete notification
   */
  async deleteNotification(notificationId, userId) {
    return await notificationRepository.delete(notificationId, userId);
  },

  /**
   * Create notification (used by other services)
   */
  async createNotification(data) {
    const notification = await notificationRepository.create(data);
    
    // Send push notification if user has subscriptions
    try {
      await pushNotificationService.sendNotificationPush(data.userId, notification);
    } catch (error) {
      // Don't fail notification creation if push fails
      console.error('Failed to send push notification:', error);
    }
    
    return notification;
  },

  /**
   * Send admin notification to all users
   */
  async sendAdminNotification(title, message, metadata = {}) {
    // Get all active users
    const users = await userRepository.search({ isActive: true }, { limit: 10000 });

    // Create notifications for all users
    const notifications = users.map((user) => ({
      userId: user._id,
      type: 'admin',
      title,
      message,
      isAdminNotification: true,
      metadata,
    }));

    // Bulk insert (you might want to use insertMany for better performance)
    const Notification = (await import('../models/Notification.js')).default;
    return await Notification.insertMany(notifications);
  },
};

