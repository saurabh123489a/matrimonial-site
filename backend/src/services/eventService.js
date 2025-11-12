import { eventRepository } from '../repositories/eventRepository.js';
import { rsvpRepository } from '../repositories/rsvpRepository.js';
import { userRepository } from '../repositories/userRepository.js';

export const eventService = {
  async createEvent(data, organizerId) {
    const organizer = await userRepository.findById(organizerId);
    if (!organizer) {
      const error = new Error('Organizer not found');
      error.status = 404;
      throw error;
    }

    const eventData = {
      ...data,
      organizer: organizerId,
      organizerName: organizer.name,
    };

    return await eventRepository.create(eventData);
  },

  async getEventById(eventId, userId = null) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      const error = new Error('Event not found');
      error.status = 404;
      throw error;
    }

    // Get RSVP stats
    const rsvpStats = await rsvpRepository.getRSVPStats(eventId);
    
    // Get user's RSVP if logged in
    let userRSVP = null;
    if (userId) {
      userRSVP = await rsvpRepository.findByEventAndUser(eventId, userId);
    }

    return {
      ...event.toObject(),
      rsvpStats,
      userRSVP,
    };
  },

  async getEvents(filters = {}, options = {}) {
    return await eventRepository.findAll(filters, options);
  },

  async getEventsByDateRange(startDate, endDate, filters = {}) {
    return await eventRepository.findByDateRange(startDate, endDate, filters);
  },

  async updateEvent(eventId, data, userId) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      const error = new Error('Event not found');
      error.status = 404;
      throw error;
    }

    // Check if user is organizer or admin
    if (event.organizer._id.toString() !== userId.toString()) {
      const user = await userRepository.findById(userId);
      if (!user || !user.isAdmin) {
        const error = new Error('Unauthorized: Only organizer or admin can update event');
        error.status = 403;
        throw error;
      }
    }

    return await eventRepository.updateById(eventId, data);
  },

  async deleteEvent(eventId, userId) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      const error = new Error('Event not found');
      error.status = 404;
      throw error;
    }

    // Check if user is organizer or admin
    if (event.organizer._id.toString() !== userId.toString()) {
      const user = await userRepository.findById(userId);
      if (!user || !user.isAdmin) {
        const error = new Error('Unauthorized: Only organizer or admin can delete event');
        error.status = 403;
        throw error;
      }
    }

    return await eventRepository.deleteById(eventId);
  },

  async rsvpToEvent(eventId, userId, rsvpData) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      const error = new Error('Event not found');
      error.status = 404;
      throw error;
    }

    // Check if event has max attendees limit
    if (event.maxAttendees) {
      const goingCount = await rsvpRepository.countByEvent(eventId, 'going');
      if (rsvpData.status === 'going' && goingCount >= event.maxAttendees) {
        const error = new Error('Event is full');
        error.status = 400;
        throw error;
      }
    }

    return await rsvpRepository.updateByEventAndUser(eventId, userId, {
      ...rsvpData,
      userId,
      eventId,
    });
  },

  async cancelRSVP(eventId, userId) {
    return await rsvpRepository.deleteByEventAndUser(eventId, userId);
  },

  async getUserRSVPs(userId, options = {}) {
    return await rsvpRepository.findByUserId(userId, options);
  },
};

