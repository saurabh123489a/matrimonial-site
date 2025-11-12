import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import {
  createBadge,
  getBadges,
  getActiveBadges,
  assignBadge,
  getUserBadges,
  removeBadge,
  updateBadge,
  deleteBadge,
} from '../controllers/badgeController.js';

const router = express.Router();

// Public routes
router.get('/', getBadges);
router.get('/active', getActiveBadges);
router.get('/user/:userId', getUserBadges);

// Admin routes
router.use(requireAuth);
router.use(requireAdmin);

router.post('/', createBadge);
router.post('/:badgeId/assign/:userId', assignBadge);
router.delete('/:badgeId/user/:userId', removeBadge);
router.patch('/:id', updateBadge);
router.delete('/:id', deleteBadge);

export default router;

