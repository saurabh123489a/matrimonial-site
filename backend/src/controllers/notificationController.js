import { notificationService } from '../services/notificationService.js';

/**
 * Get notifications for current user
 * GET /api/notifications
 */
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;

    if (!userId) {
      return res.status(401).json({
        status: false,
        message: 'Authentication required',
      });
    }

    const { page = 1, limit = 20, isRead = null, type = null } = req.query;
    const skip = (page - 1) * limit;

    const notifications = await notificationService.getNotifications(userId, {
      skip: parseInt(skip),
      limit: parseInt(limit),
      isRead: isRead !== null ? isRead === 'true' : null,
      type: type || null,
    });

    const unreadCount = await notificationService.getUnreadCount(userId);

    return res.json({
      status: true,
      message: 'Notifications retrieved successfully',
      data: notifications,
      unreadCount,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get unread notification count
 * GET /api/notifications/unread-count
 */
export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;

    if (!userId) {
      return res.status(401).json({
        status: false,
        message: 'Authentication required',
      });
    }

    const count = await notificationService.getUnreadCount(userId);

    return res.json({
      status: true,
      message: 'Unread count retrieved successfully',
      data: { count },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Mark notification as read
 * PUT /api/notifications/:id/read
 */
export const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        status: false,
        message: 'Authentication required',
      });
    }

    const notification = await notificationService.markAsRead(id, userId);

    return res.json({
      status: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;

    if (!userId) {
      return res.status(401).json({
        status: false,
        message: 'Authentication required',
      });
    }

    await notificationService.markAllAsRead(userId);

    return res.json({
      status: true,
      message: 'All notifications marked as read',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        status: false,
        message: 'Authentication required',
      });
    }

    await notificationService.deleteNotification(id, userId);

    return res.json({
      status: true,
      message: 'Notification deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Send admin notification to all users
 * POST /api/notifications/admin/send
 */
export const sendAdminNotification = async (req, res, next) => {
  try {
    // TODO: Add admin authentication middleware
    const { title, message, metadata } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        status: false,
        message: 'title and message are required',
      });
    }

    const result = await notificationService.sendAdminNotification(title, message, metadata);

    return res.json({
      status: true,
      message: 'Admin notification sent successfully',
      data: { count: result.length },
    });
  } catch (err) {
    next(err);
  }
};

