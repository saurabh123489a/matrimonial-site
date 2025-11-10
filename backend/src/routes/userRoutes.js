import express from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { validate, updateProfileSchema, registerSchema } from '../utils/validation.js';
import { requireAuthForData } from '../middleware/antiScraping.js';
import {
  createUser,
  getUserProfile,
  getMyProfile,
  updateUserProfile,
  deleteUserProfile,
  getAllUsers,
} from '../controllers/userController.js';

const router = express.Router();

/**
 * User Profile Routes
 * All routes follow RESTful conventions
 */

// Create new user profile (public)
router.post('/', validate(registerSchema), createUser);

// Get all users with filters - requires authentication to prevent scraping
router.get('/', requireAuthForData, optionalAuth, getAllUsers);

// Get my profile (authenticated)
router.get('/me', requireAuth, getMyProfile);

// Update my profile (authenticated)
router.put('/me', requireAuth, validate(updateProfileSchema), updateUserProfile);

// Delete my profile (authenticated)
router.delete('/me', requireAuth, deleteUserProfile);

// Get specific user profile (public)
router.get('/:id', getUserProfile);

// Update specific user profile (authenticated - only own profile)
router.put('/:id', requireAuth, validate(updateProfileSchema), updateUserProfile);

// Delete specific user profile (authenticated - only own profile)
router.delete('/:id', requireAuth, deleteUserProfile);

export default router;

