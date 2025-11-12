import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import { optionalAuth } from '../middleware/auth.js';
import {
  createPoll,
  getPolls,
  getActivePolls,
  getPollById,
  voteOnPoll,
  updatePoll,
  deletePoll,
} from '../controllers/pollController.js';

const router = express.Router();

// Public routes
router.get('/', getPolls);
router.get('/active', getActivePolls);
router.get('/:id', optionalAuth, getPollById);

// Authenticated routes
router.use(requireAuth);

router.post('/:id/vote', voteOnPoll);

// Admin routes
router.use(requireAdmin);

router.post('/', createPoll);
router.patch('/:id', updatePoll);
router.delete('/:id', deletePoll);

export default router;

