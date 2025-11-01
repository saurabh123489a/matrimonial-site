import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import { requireCommunityPosition } from '../middleware/communityMember.js';
import {
  reportProfile,
  getAllReports,
  getReport,
  updateReportStatus,
  getUserReports,
} from '../controllers/reportController.js';

const router = express.Router();

/**
 * Report Routes
 * - Community members can report profiles
 * - Admins can view and manage reports
 */

// Report a profile (requires community position)
router.post('/', requireAuth, requireCommunityPosition, reportProfile);

// Get all reports (Admin only)
router.get('/', requireAuth, requireAdmin, getAllReports);

// Get specific report (Admin only)
router.get('/:id', requireAuth, requireAdmin, getReport);

// Update report status (Admin only)
router.patch('/:id', requireAuth, requireAdmin, updateReportStatus);

// Get reports for a specific user (Admin only)
router.get('/user/:userId', requireAuth, requireAdmin, getUserReports);

export default router;

