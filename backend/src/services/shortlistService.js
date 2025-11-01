import { shortlistRepository } from '../repositories/shortlistRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { notificationService } from './notificationService.js';

export const shortlistService = {
  async addToShortlist(userId, shortlistedUserId) {
    // Check if users exist
    const [user, shortlistedUser] = await Promise.all([
      userRepository.findById(userId),
      userRepository.findById(shortlistedUserId),
    ]);

    if (!user || !shortlistedUser) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    // Cannot shortlist yourself
    if (userId.toString() === shortlistedUserId.toString()) {
      const error = new Error('Cannot shortlist yourself');
      error.status = 400;
      throw error;
    }

    // Check if already shortlisted
    const existing = await shortlistRepository.findByPair(userId, shortlistedUserId);
    if (existing) {
      const error = new Error('User already in shortlist');
      error.status = 409;
      throw error;
    }

    // Create shortlist entry
    const shortlist = await shortlistRepository.create({
      userId,
      shortlistedUserId,
    });

    // Create notification for the shortlisted user
    await notificationService.createNotification({
      userId: shortlistedUserId,
      type: 'shortlist',
      title: 'Added to Shortlist',
      message: `${user.name} added you to their shortlist`,
      relatedUserId: userId,
      relatedId: shortlist._id,
      metadata: {},
    });

    return shortlist;
  },

  async removeFromShortlist(userId, shortlistedUserId) {
    const shortlist = await shortlistRepository.findByPair(userId, shortlistedUserId);
    
    if (!shortlist) {
      const error = new Error('User not in shortlist');
      error.status = 404;
      throw error;
    }

    await shortlistRepository.remove(userId, shortlistedUserId);
    return { message: 'Removed from shortlist successfully' };
  },

  async getShortlist(userId) {
    return await shortlistRepository.getUserShortlist(userId);
  },

  async checkIfShortlisted(userId, shortlistedUserId) {
    return await shortlistRepository.checkIfShortlisted(userId, shortlistedUserId);
  },
};

