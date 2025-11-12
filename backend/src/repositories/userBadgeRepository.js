import UserBadge from '../models/UserBadge.js';

export const userBadgeRepository = {
  async create(data) {
    return await UserBadge.create(data);
  },

  async findByUserId(userId) {
    return await UserBadge.find({ userId, isVisible: true })
      .populate('badgeId')
      .populate('assignedBy', 'name')
      .sort({ assignedAt: -1 });
  },

  async findByBadgeId(badgeId) {
    return await UserBadge.find({ badgeId })
      .populate('userId', 'name email photos')
      .sort({ assignedAt: -1 });
  },

  async findByUserAndBadge(userId, badgeId) {
    return await UserBadge.findOne({ userId, badgeId });
  },

  async hasBadge(userId, badgeId) {
    const count = await UserBadge.countDocuments({ userId, badgeId, isVisible: true });
    return count > 0;
  },

  async assignBadge(userId, badgeId, assignedBy = null, reason = null) {
    // Check if already assigned
    const existing = await this.findByUserAndBadge(userId, badgeId);
    if (existing) {
      return existing;
    }
    return await UserBadge.create({
      userId,
      badgeId,
      assignedBy,
      reason,
    });
  },

  async removeBadge(userId, badgeId) {
    return await UserBadge.findOneAndDelete({ userId, badgeId });
  },

  async updateVisibility(userId, badgeId, isVisible) {
    return await UserBadge.findOneAndUpdate(
      { userId, badgeId },
      { $set: { isVisible } },
      { new: true }
    );
  },
};

