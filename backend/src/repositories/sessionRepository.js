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

  /**
   * Logout: Deactivate a specific session and set expiration to now
   * @param {string} sessionId - Session ID to logout
   * @param {string} userId - User ID for validation
   * @returns {Promise<Object>} Updated session
   */
  async logout(sessionId, userId) {
    return await Session.findOneAndUpdate(
      { _id: sessionId, userId },
      { 
        isActive: false, 
        expiresAt: new Date() // Immediately expire the session
      },
      { new: true }
    );
  },

  /**
   * Deactivate all active sessions for a user (used on password change)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Update result
   */
  async deactivateAllUserSessions(userId) {
    return await Session.updateMany(
      { userId, isActive: true },
      { 
        isActive: false,
        expiresAt: new Date() // Immediately expire all sessions
      }
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

