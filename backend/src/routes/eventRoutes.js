import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { optionalAuth } from '../middleware/auth.js';
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  rsvpToEvent,
  cancelRSVP,
  getMyRSVPs,
} from '../controllers/eventController.js';

const router = express.Router();

// Public routes
router.get('/', getEvents);
router.get('/:id', optionalAuth, getEventById);

// Authenticated routes
router.use(requireAuth);

router.post('/', createEvent);
router.patch('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.post('/:id/rsvp', rsvpToEvent);
router.delete('/:id/rsvp', cancelRSVP);
router.get('/my-rsvps/list', getMyRSVPs);

export default router;

