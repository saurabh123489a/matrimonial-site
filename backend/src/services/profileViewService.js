import { profileViewRepository } from '../repositories/profileViewRepository.js';
import { notificationRepository } from '../repositories/notificationRepository.js';
import { userRepository } from '../repositories/userRepository.js';

export const profileViewService = {
  /**
   * Track a profile view
   * @param {string} viewerId - ID of user viewing the profile
   * @param {string} viewedUserId - ID of user whose profile is being viewed
   */
  async trackView(viewerId, viewedUserId) {
    // Don't track if user views their own profile
    if (String(viewerId) === String(viewedUserId)) {
      return null;
    }

    // Check if viewed recently (within last hour) to avoid duplicate notifications
    const recentView = await profileViewRepository.hasViewedRecently(
      viewerId,
      viewedUserId,
      1
    );

    if (recentView) {
      return recentView; // Already viewed recently
    }

    // Create view record
    const view = await profileViewRepository.create({
      viewerId,
      viewedUserId,
      viewedAt: new Date(),
    });

    // Get viewer details for notification
    const viewer = await userRepository.findById(viewerId);
    const viewedUser = await userRepository.findById(viewedUserId);

    // Create notification for viewed user (if not their own profile)
    if (viewer && viewedUser) {
      await notificationRepository.create({
        userId: viewedUserId,
        type: 'profile_view',
        title: 'Profile Viewed',
        message: `${viewer.name} viewed your profile`,
        relatedUserId: viewerId,
        relatedId: view._id,
        metadata: {
          viewerName: viewer.name,
        },
      });
    }

    return view;
  },

  /**
   * Get profile views for a user
   */
  async getViews(userId, options = {}) {
    return await profileViewRepository.findByViewedUser(userId, options);
  },

  /**
   * Get view count for a user
   */
  async getViewCount(userId) {
    return await profileViewRepository.countByViewedUser(userId);
  },
};

