import ProfileView from '../models/ProfileView.js';

export const profileViewRepository = {
  async create(data) {
    return await ProfileView.create(data);
  },

  async findByViewedUser(viewedUserId, options = {}) {
    const { skip = 0, limit = 20, sortBy = 'viewedAt', sortOrder = -1 } = options;
    
    return await ProfileView.find({ viewedUserId })
      .populate('viewerId', 'name email phone photos')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);
  },

  async findByViewer(viewerId, viewedUserId) {
    return await ProfileView.findOne({
      viewerId,
      viewedUserId,
    });
  },

  async hasViewedRecently(viewerId, viewedUserId, hours = 1) {
    const recentTime = new Date();
    recentTime.setHours(recentTime.getHours() - hours);
    
    return await ProfileView.findOne({
      viewerId,
      viewedUserId,
      viewedAt: { $gte: recentTime },
    });
  },

  async countByViewedUser(viewedUserId) {
    return await ProfileView.countDocuments({ viewedUserId });
  },

  async markAsMessaged(viewerId, viewedUserId) {
    return await ProfileView.updateOne(
      { viewerId, viewedUserId },
      { $set: { hasMessaged: true } },
      { upsert: false }
    );
  },
};

