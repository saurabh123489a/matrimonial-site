import express from 'express';
import userRoutes from './userRoutes.js';
import authRoutes from './authRoutes.js';
import interestRoutes from './interestRoutes.js';
import shortlistRoutes from './shortlistRoutes.js';
import locationRoutes from './locationRoutes.js';
import photoRoutes from './photoRoutes.js';
import questionRoutes from './questionRoutes.js';
import answerRoutes from './answerRoutes.js';
import profileViewRoutes from './profileViewRoutes.js';
import messageRoutes from './messageRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import metaDataRoutes from './metaDataRoutes.js';
import reportRoutes from './reportRoutes.js';
import adminRoutes from './adminRoutes.js';
import horoscopeRoutes from './horoscopeRoutes.js';
import healthRoutes from './healthRoutes.js';
import eventRoutes from './eventRoutes.js';
import pollRoutes from './pollRoutes.js';
import badgeRoutes from './badgeRoutes.js';

const router = express.Router();

/**
 * API Routes
 * All routes are prefixed with /api
 */

// User profile routes
router.use('/users', userRoutes);
// Auth routes
router.use('/auth', authRoutes);
// Interest routes
router.use('/interests', interestRoutes);
// Shortlist routes
router.use('/shortlist', shortlistRoutes);
// Location routes (countries, cities, states)
router.use('/locations', locationRoutes);
// Photo routes
router.use('/photos', photoRoutes);
// Community routes (questions & answers)
router.use('/questions', questionRoutes);
router.use('/answers', answerRoutes);
// Profile views routes
router.use('/profile-views', profileViewRoutes);
// Message routes
router.use('/messages', messageRoutes);
// Notification routes
router.use('/notifications', notificationRoutes);
// Meta data routes (education, occupation)
router.use('/meta', metaDataRoutes);
// Report routes (profile reporting/flagging)
router.use('/reports', reportRoutes);
// Admin routes (admin portal)
router.use('/admin', adminRoutes);
// Horoscope routes
router.use('/horoscope', horoscopeRoutes);
// Health check routes
router.use('/health', healthRoutes);
// Event routes (community gatherings)
router.use('/events', eventRoutes);
// Poll routes (admin surveys)
router.use('/polls', pollRoutes);
// Badge routes (user achievements)
router.use('/badges', badgeRoutes);

export default router;

