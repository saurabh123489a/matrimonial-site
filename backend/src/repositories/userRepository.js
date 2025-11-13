import User from '../models/User.js';
import { sortPhotos } from '../utils/photoUtils.js';

/**
 * User Repository - Data access layer for user operations
 * Follows Repository pattern for separation of concerns
 */
export const userRepository = {
  /**
   * Create a new user
   */
  create: async (userData) => {
    return await User.create(userData);
  },

  /**
   * Find user by ID or Gahoi ID
   * Ensures photos are sorted with primary photo first
   * If userId is numeric (Gahoi ID), searches by gahoiId field
   * @param {string} userId - User ID (MongoDB _id) or Gahoi ID (5-digit number starting with 10000)
   * @returns {Promise<Object|null>} User object or null if not found
   */
  findById: async (userId) => {
    let user;
    
    // Check if userId is a Gahoi ID (numeric string starting with 1000)
    const isGahoiId = /^\d{5}$/.test(userId) && parseInt(userId) >= 10000;
    
    if (isGahoiId) {
      // Search by Gahoi ID
      user = await User.findOne({ gahoiId: parseInt(userId) }).select('-passwordHash');
    } else {
      // Search by MongoDB _id
      user = await User.findById(userId).select('-passwordHash');
    }
    
    if (user && user.photos && user.photos.length > 0) {
      // Sort photos: primary first, then by order
      sortPhotos(user.photos);
    }
    return user;
  },

  /**
   * Find user by email or phone (for login/registration)
   * @param {string} identifier - Email address or phone number
   * @returns {Promise<Object|null>} User object or null if not found
   */
  findByEmailOrPhone: async (identifier) => {
    return await User.findOne({
      $or: [
        { email: identifier },
        { phone: identifier }
      ]
    });
  },

  /**
   * Find user by phone number
   */
  findByPhone: async (phone) => {
    return await User.findOne({ phone });
  },

  /**
   * Find user with password (for authentication)
   */
  findByIdWithPassword: async (userId) => {
    return await User.findById(userId);
  },

  /**
   * Update user by ID
   * Ensures photos are sorted with primary photo first
   */
  updateById: async (userId, updateData) => {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-passwordHash');
    
    // Sort photos: primary first, then by order
    if (user && user.photos && user.photos.length > 0) {
      sortPhotos(user.photos);
    }
    
    return user;
  },

  /**
   * Delete user by ID (soft delete by setting isActive to false)
   */
  deleteById: async (userId) => {
    return await User.findByIdAndUpdate(
      userId,
      { $set: { isActive: false } },
      { new: true }
    ).select('-passwordHash');
  },

  /**
   * Search users with filters and pagination
   * Ensures photos are sorted with primary photo first
   * Hides phone numbers for female users
   * @param {Object} filters - MongoDB query filters
   * @param {Object} [options] - Query options
   * @param {number} [options.skip=0] - Number of documents to skip
   * @param {number} [options.limit=20] - Maximum number of documents to return
   * @param {string} [options.sortBy='createdAt'] - Field to sort by
   * @param {number} [options.sortOrder=-1] - Sort order (1 for ascending, -1 for descending)
   * @returns {Promise<Array>} Array of user objects
   */
  search: async (filters, options = {}) => {
    const {
      skip = 0,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = -1
    } = options;

    const users = await User.find(filters)
      .select('-passwordHash')
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .exec();

    // Sort photos for each user: primary first
    // Hide phone numbers for female users
    users.forEach(user => {
      if (user.photos && user.photos.length > 0) {
        sortPhotos(user.photos);
      }
      // Hide phone number for female users
      if (user.gender === 'female') {
        user.phone = undefined;
      }
    });

    return users;
  },

  /**
   * Count users matching filters
   */
  count: async (filters) => {
    return await User.countDocuments(filters);
  },

  /**
   * Check if email exists
   */
  emailExists: async (email, excludeUserId = null) => {
    const query = { email };
    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }
    return await User.exists(query);
  },

  /**
   * Check if phone exists
   */
  phoneExists: async (phone, excludeUserId = null) => {
    const query = { phone };
    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }
    return await User.exists(query);
  },
};

