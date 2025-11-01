import LoginLog from '../models/LoginLog.js';

export const loginLogRepository = {
  async create(loginData) {
    return await LoginLog.create(loginData);
  },

  async findById(logId) {
    return await LoginLog.findById(logId).populate('userId', 'name email phone');
  },

  async findByUserId(userId, options = {}) {
    const { limit = 50, page = 1 } = options;
    const skip = (page - 1) * limit;
    
    return await LoginLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('userId', 'name email phone');
  },

  async count(filters = {}) {
    return await LoginLog.countDocuments(filters);
  },

  async getRecentLogins(userId, limit = 10) {
    return await LoginLog.find({ userId, status: 'success' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name email phone');
  },
};

