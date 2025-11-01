import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  createAnswer,
  getAnswers,
  updateAnswer,
  deleteAnswer,
  acceptAnswer,
  voteAnswer,
} from '../controllers/answerController.js';

const router = express.Router();

// Public route
router.get('/question/:questionId', getAnswers);

// Protected routes
router.use(requireAuth);
router.post('/question/:questionId', createAnswer);
router.put('/:id', updateAnswer);
router.delete('/:id', deleteAnswer);
router.post('/:id/accept/:questionId', acceptAnswer);
router.post('/:id/vote', voteAnswer);

export default router;

