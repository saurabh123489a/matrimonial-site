import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { userRepository } from '../repositories/userRepository.js';
import User from '../models/User.js';

/**
 * User Service - Business logic layer for user operations
 */
export const userService = {
  /**
   * Get next available Gahoi ID for a gender
   * Even numbers = Male, Odd numbers = Female
   */
  async getNextGahoiId(gender) {
    const baseId = 10000;
    
    if (gender === 'male') {
      // Find the highest even Gahoi ID
      const lastMale = await User.findOne({ gender: 'male', gahoiId: { $exists: true } })
        .sort({ gahoiId: -1 })
        .exec();
      
      if (lastMale && lastMale.gahoiId) {
        // Get next even number
        return lastMale.gahoiId + 2;
      }
      // Start with 10000 if no males exist
      return baseId;
    } else if (gender === 'female') {
      // Find the highest odd Gahoi ID
      const lastFemale = await User.findOne({ gender: 'female', gahoiId: { $exists: true } })
        .sort({ gahoiId: -1 })
        .exec();
      
      if (lastFemale && lastFemale.gahoiId) {
        // Get next odd number
        return lastFemale.gahoiId + 2;
      }
      // Start with 10001 if no females exist
      return baseId + 1;
    } else {
      // For other genders, use even numbers after all males
      const lastMale = await User.findOne({ gender: 'male', gahoiId: { $exists: true } })
        .sort({ gahoiId: -1 })
        .exec();
      const lastOther = await User.findOne({ 
        gender: { $nin: ['male', 'female'] }, 
        gahoiId: { $exists: true } 
      })
        .sort({ gahoiId: -1 })
        .exec();
      
      const lastId = Math.max(
        lastMale?.gahoiId || baseId,
        lastOther?.gahoiId || baseId
      );
      
      // Get next even number after the highest
      return lastId + 2;
    }
  },

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

    // Auto-assign Gahoi ID if not provided and gender is specified
    if (!userData.gahoiId && userData.gender) {
      try {
        userData.gahoiId = await this.getNextGahoiId(userData.gender);
      } catch (error) {
        console.error('Error assigning Gahoi ID:', error);
        // Continue without Gahoi ID if assignment fails
      }
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

    // Hide phone number for female users when viewed by others
    // Users can always see their own phone number
    if (String(userId) !== String(requesterId) && user.gender === 'female') {
      user.phone = undefined;
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

    // Auto-calculate horoscope if DOB, time, and location are provided
    const mergedUserData = { ...existing?.toObject(), ...updateData };
    const shouldCalculateHoroscope = 
      (updateData.dateOfBirth || existing?.dateOfBirth) && 
      (updateData.horoscopeDetails?.timeOfBirth || existing?.horoscopeDetails?.timeOfBirth) &&
      (mergedUserData.city || mergedUserData.state || mergedUserData.country);
    
    if (shouldCalculateHoroscope) {
      const { astrologyCalculationService } = await import('./astrologyCalculationService.js');
      
      const dob = updateData.dateOfBirth || existing?.dateOfBirth;
      const timeOfBirth = updateData.horoscopeDetails?.timeOfBirth || existing?.horoscopeDetails?.timeOfBirth;
      // Use profile location (city, state, country) for horoscope calculation
      const placeOfBirth = mergedUserData.city || mergedUserData.state || mergedUserData.country || 'India';
      
      if (dob && timeOfBirth) {
        try {
          const horoscopeResult = await astrologyCalculationService.calculateHoroscope(
            dob,
            timeOfBirth,
            placeOfBirth
          );
          
          if (horoscopeResult && horoscopeResult.success && horoscopeResult.data) {
            // Merge calculated horoscope with existing horoscope details
            // Only auto-fill if user hasn't manually set these values
            const manuallySetRashi = updateData.horoscopeDetails?.rashi && updateData.horoscopeDetails.rashi !== '';
            const manuallySetNakshatra = updateData.horoscopeDetails?.nakshatra && updateData.horoscopeDetails.nakshatra !== '';
            
            updateData.horoscopeDetails = {
              ...existing?.horoscopeDetails,
              ...updateData.horoscopeDetails,
              // Only use calculated values if user hasn't manually set them
              rashi: manuallySetRashi 
                ? updateData.horoscopeDetails.rashi 
                : (horoscopeResult.data.rashi || updateData.horoscopeDetails?.rashi || existing?.horoscopeDetails?.rashi),
              nakshatra: manuallySetNakshatra 
                ? updateData.horoscopeDetails.nakshatra 
                : (horoscopeResult.data.nakshatra || updateData.horoscopeDetails?.nakshatra || existing?.horoscopeDetails?.nakshatra),
              manglikStatus: horoscopeResult.data.manglikStatus || updateData.horoscopeDetails?.manglikStatus || existing?.horoscopeDetails?.manglikStatus,
              timeOfBirth: timeOfBirth || updateData.horoscopeDetails?.timeOfBirth || existing?.horoscopeDetails?.timeOfBirth,
            };
          }
        } catch (error) {
          console.error('Error calculating horoscope:', error);
          console.error('Error stack:', error.stack);
          // Don't fail the update if horoscope calculation fails - continue without horoscope
        }
      }
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

    // Only show active users (or users where isActive is not explicitly set to false)
    // This ensures profiles show even if isActive field wasn't explicitly set
    // Only add this filter if isActive is not already specified in filters
    if (!filters.hasOwnProperty('isActive')) {
      filters.isActive = { $ne: false }; // Show if isActive is true or not set (null/undefined)
    }

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

