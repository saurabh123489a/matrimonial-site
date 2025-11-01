import Notification from '../models/Notification.js';

export const notificationRepository = {
  async create(data) {
    return await Notification.create(data);
  },

  async findByUser(userId, options = {}) {
    const {
      skip = 0,
      limit = 20,
      isRead = null,
      type = null,
      sortBy = 'createdAt',
      sortOrder = -1,
    } = options;

    const query = { userId };
    if (isRead !== null) query.isRead = isRead;
    if (type) query.type = type;

    return await Notification.find(query)
      .populate('relatedUserId', 'name photos')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);
  },

  async markAsRead(notificationId, userId) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    );
  },

  async markAllAsRead(userId) {
    return await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
  },

  async getUnreadCount(userId) {
    return await Notification.countDocuments({
      userId,
      isRead: false,
    });
  },

  async delete(notificationId, userId) {
    return await Notification.findOneAndDelete({
      _id: notificationId,
      userId,
    });
  },

  async createAdminNotification(data) {
    // Create notification for all users
    const Notification = (await import('../models/Notification.js')).default;
    // This will be handled in the service for bulk creation
    return await Notification.create({ ...data, isAdminNotification: true });
  },
};

