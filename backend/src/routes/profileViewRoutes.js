import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { trackView, getMyViews } from '../controllers/profileViewController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/track', trackView);
router.get('/my-views', getMyViews);

export default router;

