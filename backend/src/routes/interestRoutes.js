import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  sendInterest,
  respondToInterest,
  getIncomingInterests,
  getOutgoingInterests,
} from '../controllers/interestController.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

router.post('/send', sendInterest);
router.post('/respond', respondToInterest);
router.get('/incoming', getIncomingInterests);
router.get('/outgoing', getOutgoingInterests);

export default router;

