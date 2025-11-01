import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import {
  sendGlobalNotification,
  sendPersonalNotification,
  getAllUsersAdmin,
  updateUserAdmin,
  deleteUserAdmin,
  createAdminUser,
  getDashboardStats,
  getAllMessagesAdmin,
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(requireAuth);
router.use(requireAdmin);

/**
 * Admin Routes
 */

// Dashboard stats
router.get('/dashboard/stats', getDashboardStats);

// Notification routes
router.post('/notifications/global', sendGlobalNotification);
router.post('/notifications/personal', sendPersonalNotification);

// User management routes
router.get('/users', getAllUsersAdmin);
router.patch('/users/:id', updateUserAdmin);
router.delete('/users/:id', deleteUserAdmin);

// Admin creation route
router.post('/users/create-admin', createAdminUser);

// Messages management (Admin only)
router.get('/messages', getAllMessagesAdmin);

export default router;

