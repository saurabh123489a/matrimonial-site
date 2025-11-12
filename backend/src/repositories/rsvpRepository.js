import RSVP from '../models/RSVP.js';

export const rsvpRepository = {
  async create(data) {
    return await RSVP.create(data);
  },

  async findByEventId(eventId) {
    return await RSVP.find({ eventId })
      .populate('userId', 'name email phone photos')
      .sort({ createdAt: -1 });
  },

  async findByUserId(userId, options = {}) {
    const { skip = 0, limit = 50 } = options;
    return await RSVP.find({ userId })
      .populate('eventId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  },

  async findByEventAndUser(eventId, userId) {
    return await RSVP.findOne({ eventId, userId });
  },

  async updateByEventAndUser(eventId, userId, data) {
    return await RSVP.findOneAndUpdate(
      { eventId, userId },
      { $set: data },
      { new: true, upsert: true }
    );
  },

  async deleteByEventAndUser(eventId, userId) {
    return await RSVP.findOneAndDelete({ eventId, userId });
  },

  async countByEvent(eventId, status = null) {
    const filter = { eventId };
    if (status) filter.status = status;
    return await RSVP.countDocuments(filter);
  },

  async getRSVPStats(eventId) {
    const [going, maybe, notGoing] = await Promise.all([
      RSVP.countDocuments({ eventId, status: 'going' }),
      RSVP.countDocuments({ eventId, status: 'maybe' }),
      RSVP.countDocuments({ eventId, status: 'not-going' }),
    ]);
    return { going, maybe, notGoing, total: going + maybe + notGoing };
  },
};

