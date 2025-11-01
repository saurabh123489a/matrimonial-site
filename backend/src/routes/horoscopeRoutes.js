import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getHoroscopeMatch } from '../controllers/horoscopeController.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Get horoscope matching score
router.get('/match/:userId', getHoroscopeMatch);

export default router;

