import ErrorLog from '../models/ErrorLog.js';

export const errorLogRepository = {
  async create(errorData) {
    return await ErrorLog.create(errorData);
  },

  async findById(errorId) {
    return await ErrorLog.findById(errorId).populate('userId', 'name email phone');
  },

  async search(filters = {}, options = {}) {
    const { page = 1, limit = 50, sortBy = 'createdAt', sortOrder = -1 } = options;
    const skip = (page - 1) * limit;

    return await ErrorLog.find(filters)
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip(skip)
      .populate('userId', 'name email phone')
      .populate('resolvedBy', 'name email');
  },

  async count(filters = {}) {
    return await ErrorLog.countDocuments(filters);
  },

  async markResolved(errorId, resolvedBy, notes) {
    return await ErrorLog.findByIdAndUpdate(
      errorId,
      {
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy,
        notes,
      },
      { new: true }
    );
  },

  async getUnresolvedErrors(limit = 50) {
    return await ErrorLog.find({ resolved: false })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name email phone');
  },
};

