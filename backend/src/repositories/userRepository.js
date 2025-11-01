import User from '../models/User.js';

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
   * Find user by ID
   * Ensures photos are sorted with primary photo first
   */
  findById: async (userId) => {
    const user = await User.findById(userId).select('-passwordHash');
    if (user && user.photos && user.photos.length > 0) {
      // Sort photos: primary first, then by order
      user.photos.sort((a, b) => {
        if (a.isPrimary) return -1;
        if (b.isPrimary) return 1;
        return (a.order || 0) - (b.order || 0);
      });
    }
    return user;
  },

  /**
   * Find user by email or phone (for login/registration)
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
      user.photos.sort((a, b) => {
        if (a.isPrimary) return -1;
        if (b.isPrimary) return 1;
        return (a.order || 0) - (b.order || 0);
      });
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
    users.forEach(user => {
      if (user.photos && user.photos.length > 0) {
        user.photos.sort((a, b) => {
          if (a.isPrimary) return -1;
          if (b.isPrimary) return 1;
          return (a.order || 0) - (b.order || 0);
        });
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

