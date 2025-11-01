import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  sendMessage,
  getConversation,
  getConversations,
  markConversationAsRead,
} from '../controllers/messageController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/send', sendMessage);
router.get('/conversations', getConversations);
router.get('/conversation/:userId', getConversation);
router.post('/conversation/:userId/read', markConversationAsRead);

export default router;

