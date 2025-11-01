import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  addToShortlist,
  removeFromShortlist,
  getShortlist,
  checkIfShortlisted,
} from '../controllers/shortlistController.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

router.post('/add', addToShortlist);
router.delete('/remove/:shortlistedUserId', removeFromShortlist);
router.get('/', getShortlist);
router.get('/check/:shortlistedUserId', checkIfShortlisted);

export default router;

