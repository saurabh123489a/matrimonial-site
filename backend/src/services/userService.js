import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { userRepository } from '../repositories/userRepository.js';

/**
 * User Service - Business logic layer for user operations
 */
export const userService = {
  /**
   * Create a new user profile
   */
  async createUser(userData) {
    // Check if user already exists
    const existing = await userRepository.findByEmailOrPhone(
      userData.email || userData.phone
    );
    
    if (existing) {
      const error = new Error('User with this email or phone already exists');
      error.status = 409;
      throw error;
    }

    // Hash password if provided
    if (userData.password) {
      userData.passwordHash = await bcrypt.hash(userData.password, 10);
      delete userData.password; // Remove plain password
    }

    // Calculate age from date of birth if provided
    if (userData.dateOfBirth && !userData.age) {
      const today = new Date();
      const birthDate = new Date(userData.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      userData.age = age;
    }

    // Check profile completeness
    userData.isProfileComplete = checkProfileCompleteness(userData);

    const user = await userRepository.create(userData);
    return user;
  },

  /**
   * Get user profile by ID
   * @param {string} userId - User ID to fetch
   * @param {string} requesterId - Optional: ID of user requesting (to allow inactive profile viewing)
   */
  async getUserProfile(userId, requesterId = null) {
    const user = await userRepository.findById(userId);
    
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    // Allow users to view their own profile even if inactive
    // Only check isActive for other users' profiles
    if (!user.isActive && String(userId) !== String(requesterId)) {
      const error = new Error('User profile is inactive');
      error.status = 404;
      throw error;
    }

    return user;
  },

  /**
   * Update user profile
   */
  async updateUserProfile(userId, updateData) {
    // Check if user exists
    const existing = await userRepository.findById(userId);
    if (!existing) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    // Check for email/phone conflicts
    if (updateData.email) {
      const emailExists = await userRepository.emailExists(updateData.email, userId);
      if (emailExists) {
        const error = new Error('Email already exists');
        error.status = 409;
        throw error;
      }
    }

    if (updateData.phone) {
      const phoneExists = await userRepository.phoneExists(updateData.phone, userId);
      if (phoneExists) {
        const error = new Error('Phone number already exists');
        error.status = 409;
        throw error;
      }
    }

    // Recalculate age if date of birth is updated
    if (updateData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(updateData.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      updateData.age = age;
    }

    // Update profile completeness
    const mergedData = { ...existing.toObject(), ...updateData };
    updateData.isProfileComplete = checkProfileCompleteness(mergedData);

    const updatedUser = await userRepository.updateById(userId, updateData);
    return updatedUser;
  },

  /**
   * Delete user profile (soft delete)
   */
  async deleteUserProfile(userId) {
    const user = await userRepository.findById(userId);
    
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    await userRepository.deleteById(userId);
    return { message: 'User profile deleted successfully' };
  },

  /**
   * Get all user profiles (with pagination and filters)
   * @param {Object} filters - Search filters
   * @param {Object} options - Pagination and exclusion options
   * @param {string} options.excludeUserId - User ID to exclude from results
   */
  async getAllUsers(filters = {}, options = {}) {
    const { page = 1, limit = 20, excludeUserId = null } = options;
    const skip = (page - 1) * limit;

    // Only show active users
    filters.isActive = true;

    // Exclude current user if provided
    if (excludeUserId) {
      // Convert to ObjectId for proper MongoDB query
      try {
        filters._id = { $ne: new mongoose.Types.ObjectId(excludeUserId) };
      } catch (error) {
        // If conversion fails, use string comparison
        filters._id = { $ne: excludeUserId };
      }
    }

    const [users, total] = await Promise.all([
      userRepository.search(filters, { skip, limit }),
      userRepository.count(filters)
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },
};

/**
 * Helper function to check if profile is complete
 * Profile is considered complete if essential fields are filled
 */
function checkProfileCompleteness(userData) {
  const essentialFields = [
    'name',
    'gender',
    'age',
    'email',
    'phone',
    'city',
    'religion'
  ];

  const hasEssentialFields = essentialFields.every(field => {
    return userData[field] !== null && 
           userData[field] !== undefined && 
           userData[field] !== '';
  });

  // Profile should have at least one photo
  const hasPhotos = userData.photos && userData.photos.length > 0;

  return hasEssentialFields && hasPhotos;
}

