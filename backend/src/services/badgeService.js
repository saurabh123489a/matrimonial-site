import { badgeRepository } from '../repositories/badgeRepository.js';
import { userBadgeRepository } from '../repositories/userBadgeRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { rsvpRepository } from '../repositories/rsvpRepository.js';
import { eventRepository } from '../repositories/eventRepository.js';

export const badgeService = {
  async createBadge(data) {
    return await badgeRepository.create(data);
  },

  async getBadges(filters = {}) {
    return await badgeRepository.findAll(filters);
  },

  async getActiveBadges() {
    return await badgeRepository.findActive();
  },

  async assignBadgeToUser(userId, badgeId, assignedBy = null, reason = null) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    const badge = await badgeRepository.findById(badgeId);
    if (!badge) {
      const error = new Error('Badge not found');
      error.status = 404;
      throw error;
    }

    return await userBadgeRepository.assignBadge(userId, badgeId, assignedBy, reason);
  },

  async getUserBadges(userId) {
    return await userBadgeRepository.findByUserId(userId);
  },

  async removeBadgeFromUser(userId, badgeId) {
    return await userBadgeRepository.removeBadge(userId, badgeId);
  },

  async checkAndAssignAutoBadges(userId) {
    const user = await userRepository.findById(userId);
    if (!user) return [];

    const assignedBadges = [];
    const allBadges = await badgeRepository.findActive();

    for (const badge of allBadges) {
      if (!badge.isAutoAssigned) continue;

      // Check if user already has this badge
      const hasBadge = await userBadgeRepository.hasBadge(userId, badge._id);
      if (hasBadge) continue;

      // Check criteria based on badge type
      let shouldAssign = false;

      switch (badge.name) {
        case 'active-mentor':
          // Check if user has helped multiple users (e.g., answered questions, provided guidance)
          // This would require additional data tracking
          shouldAssign = false; // Placeholder
          break;

        case 'verified-family':
          // Check if user has complete family information
          shouldAssign = user.family && user.isProfileComplete;
          break;

        case 'community-helper':
          // Check if user has organized events or helped in community
          const eventsOrganized = await eventRepository.count({ organizer: userId });
          shouldAssign = eventsOrganized >= 3;
          break;

        case 'active-participant':
          // Check if user has RSVP'd to multiple events
          const rsvps = await rsvpRepository.findByUserId(userId);
          shouldAssign = rsvps.length >= 5;
          break;

        default:
          shouldAssign = false;
      }

      if (shouldAssign) {
        await userBadgeRepository.assignBadge(userId, badge._id, null, 'Auto-assigned based on activity');
        assignedBadges.push(badge);
      }
    }

    return assignedBadges;
  },

  async updateBadge(badgeId, data) {
    return await badgeRepository.updateById(badgeId, data);
  },

  async deleteBadge(badgeId) {
    return await badgeRepository.deleteById(badgeId);
  },
};

