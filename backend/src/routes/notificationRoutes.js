import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendAdminNotification,
} from '../controllers/notificationController.js';

const router = express.Router();

// All routes except admin require authentication
router.use(authenticate);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

// Admin route - moved to /api/admin/notifications/global
// Keeping for backward compatibility but will redirect to admin routes
// router.post('/admin/send', requireAdmin, sendAdminNotification);

export default router;

