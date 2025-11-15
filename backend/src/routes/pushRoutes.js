import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getVapidKey,
  subscribe,
  unsubscribe,
  getSubscriptions,
} from '../controllers/pushSubscriptionController.js';

const router = express.Router();

// Public route for VAPID key
router.get('/vapid-key', getVapidKey);

// All other routes require authentication
router.use(authenticate);

router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);
router.get('/subscriptions', getSubscriptions);

export default router;

