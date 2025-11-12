import { eventService } from '../services/eventService.js';

/**
 * Create a new event
 * POST /api/events
 */
export const createEvent = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const event = await eventService.createEvent(req.body, userId);
    res.status(201).json({
      status: true,
      message: 'Event created successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all events
 * GET /api/events
 */
export const getEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, category, city, startDate, endDate } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (category) filters.category = category;
    if (city) filters.city = city;

    const options = {
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit),
      sortBy: 'eventDate',
      sortOrder: 1,
    };

    let events;
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date();
      const end = endDate ? new Date(endDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
      events = await eventService.getEventsByDateRange(start, end, filters);
    } else {
      events = await eventService.getEvents(filters, options);
    }

    res.json({
      status: true,
      message: 'Events retrieved successfully',
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get event by ID
 * GET /api/events/:id
 */
export const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    const event = await eventService.getEventById(id, userId);
    res.json({
      status: true,
      message: 'Event retrieved successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update event
 * PATCH /api/events/:id
 */
export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const event = await eventService.updateEvent(id, req.body, userId);
    res.json({
      status: true,
      message: 'Event updated successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete event
 * DELETE /api/events/:id
 */
export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    await eventService.deleteEvent(id, userId);
    res.json({
      status: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * RSVP to event
 * POST /api/events/:id/rsvp
 */
export const rsvpToEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status, guests, notes } = req.body;
    const rsvp = await eventService.rsvpToEvent(id, userId, { status, guests, notes });
    res.json({
      status: true,
      message: 'RSVP submitted successfully',
      data: rsvp,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel RSVP
 * DELETE /api/events/:id/rsvp
 */
export const cancelRSVP = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    await eventService.cancelRSVP(id, userId);
    res.json({
      status: true,
      message: 'RSVP cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's RSVPs
 * GET /api/events/my-rsvps
 */
export const getMyRSVPs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const options = {
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit),
    };
    const rsvps = await eventService.getUserRSVPs(userId, options);
    res.json({
      status: true,
      message: 'RSVPs retrieved successfully',
      data: rsvps,
    });
  } catch (error) {
    next(error);
  }
};

