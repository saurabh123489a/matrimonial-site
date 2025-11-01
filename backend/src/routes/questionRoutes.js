import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  createQuestion,
  getQuestion,
  getAllQuestions,
  updateQuestion,
  deleteQuestion,
  voteQuestion,
} from '../controllers/questionController.js';

const router = express.Router();

// Public routes
router.get('/', getAllQuestions);
router.get('/:id', getQuestion);

// Protected routes
router.use(requireAuth);
router.post('/', createQuestion);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);
router.post('/:id/vote', voteQuestion);

export default router;

