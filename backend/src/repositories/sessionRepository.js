import Session from '../models/Session.js';

export const sessionRepository = {
  async create(sessionData) {
    return await Session.create(sessionData);
  },

  async findById(sessionId) {
    return await Session.findById(sessionId).populate('userId', 'name email phone isAdmin');
  },

  async findByToken(token) {
    return await Session.findOne({ token, isActive: true })
      .populate('userId');
  },

  async findByUserId(userId, options = {}) {
    const { activeOnly = true, limit = 50 } = options;
    const query = Session.find({ userId });
    if (activeOnly) {
      query.where('isActive').equals(true);
    }
    return await query
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name email phone isAdmin');
  },

  async updateActivity(sessionId) {
    return await Session.findByIdAndUpdate(
      sessionId,
      { lastActivity: new Date() },
      { new: true }
    );
  },

  async deactivate(sessionId) {
    return await Session.findByIdAndUpdate(
      sessionId,
      { isActive: false },
      { new: true }
    );
  },

  async deactivateAllUserSessions(userId) {
    return await Session.updateMany(
      { userId, isActive: true },
      { isActive: false }
    );
  },

  async deleteExpired() {
    return await Session.deleteMany({
      expiresAt: { $lt: new Date() },
    });
  },

  async count(filters = {}) {
    return await Session.countDocuments(filters);
  },
};

