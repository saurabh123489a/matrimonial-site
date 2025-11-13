import { userService } from '../services/userService.js';
import { sanitizeUsersForPublic, getMinimalUsersData } from '../utils/sanitizeUserData.js';
import { profileViewService } from '../services/profileViewService.js';

/**
 * User Controller - Handles HTTP requests for user profile operations
 * Returns consistent JSON response format for Android client
 */

/**
 * Create a new user profile
 * POST /api/users
 */
export const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    
    res.status(201).json({
      status: true,
      message: 'User profile created successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user profile by ID
 * GET /api/users/:id
 * Uses session for viewer identification
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Get viewerId from session if authenticated
    const viewerId = req.user?.id || req.session?.userId?._id || req.session?.userId || null;
    
    // Fetch complete user data
    const user = await userService.getUserProfile(id, viewerId);
    
    // Track profile view if authenticated and viewing someone else's profile
    if (viewerId && String(viewerId) !== String(id)) {
      try {
        await profileViewService.trackView(viewerId, id);
      } catch (viewError) {
        // Don't fail the request if view tracking fails
        console.error('Failed to track profile view:', viewError);
      }
    }
    
    res.json({
      status: true,
      message: 'User profile retrieved successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user's profile (authenticated)
 * GET /api/users/me
 * Uses session to get userId and fetch complete user data
 */
export const getMyProfile = async (req, res, next) => {
  try {
    // Get userId from session (validated by auth middleware)
    const userId = req.user?.id || req.session?.userId?._id || req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({
        status: false,
        message: 'User ID not found in session'
      });
    }

    // Fetch complete user data from database
    const user = await userService.getUserProfile(userId, userId);
    
    res.json({
      status: true,
      message: 'Profile retrieved successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * PUT /api/users/:id or PUT /api/users/me
 * Uses session to get userId
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    // Get userId from session or params
    const userId = req.params.id || req.user?.id || req.session?.userId?._id || req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({
        status: false,
        message: 'User ID not found in session'
      });
    }
    
    // Fetch complete user data after update
    const updatedUser = await userService.updateUserProfile(userId, req.body);
    
    res.json({
      status: true,
      message: 'User profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user profile (soft delete)
 * DELETE /api/users/:id or DELETE /api/users/me
 */
export const deleteUserProfile = async (req, res, next) => {
  try {
    const userId = req.params.id || req.user.id;
    const result = await userService.deleteUserProfile(userId);
    
    res.json({
      status: true,
      message: result.message,
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users with pagination and filters
 * GET /api/users
 */
export const getAllUsers = async (req, res, next) => {
  try {
    // If Gahoi ID is provided, search by ID
    if (req.query.gahoiId) {
      const gahoiId = req.query.gahoiId.trim();
      
      // Validate: must be exactly 5 digits starting with 1000
      if (!/^100[0-9]{2}$/.test(gahoiId)) {
        return res.status(400).json({
          status: false,
          message: 'Gahoi ID must be a 5-digit number starting with 1000 (e.g., 10000-10099)'
        });
      }
      
      try {
        // Search for user by gahoiId field (numeric ID)
        // Gahoi ID format: 5 digits, starting with 1000
        // Even numbers = Male, Odd numbers = Female
        const result = await userService.getAllUsers(
          { gahoiId: parseInt(gahoiId) },
          { page: 1, limit: 1, excludeUserId: req.user ? req.user.id : null }
        );
        
        if (result.users && result.users.length > 0) {
          // Return only minimal data for search results
          const minimalUsers = getMinimalUsersData(result.users);
          
          return res.json({
            status: true,
            message: 'User retrieved successfully',
            data: minimalUsers,
            pagination: {
              total: 1,
              pages: 1,
              page: 1,
              limit: 1
            }
          });
        } else {
          return res.status(404).json({
            status: false,
            message: 'No profile found with this Gahoi ID'
          });
        }
      } catch (error) {
        return res.status(404).json({
          status: false,
          message: 'No profile found with this Gahoi ID'
        });
      }
    }

    // Gahoi Sathi style comprehensive filters
    const filters = {
      ...(req.query.gender && { gender: req.query.gender }),
      ...(req.query.minAge && { age: { $gte: parseInt(req.query.minAge) } }),
      ...(req.query.maxAge && { 
        age: { 
          ...(req.query.minAge ? { $gte: parseInt(req.query.minAge) } : {}),
          $lte: parseInt(req.query.maxAge)
        }
      }),
      ...(req.query.city && { city: new RegExp(req.query.city, 'i') }),
      ...(req.query.state && { state: new RegExp(req.query.state, 'i') }),
      ...(req.query.education && { education: new RegExp(req.query.education, 'i') }),
      ...(req.query.occupation && { occupation: new RegExp(req.query.occupation, 'i') }),
      ...(req.query.maritalStatus && { maritalStatus: req.query.maritalStatus }),
      ...(req.query.minHeight && { height: { $gte: parseFloat(req.query.minHeight) } }),
      ...(req.query.maxHeight && { 
        height: { 
          ...(req.query.minHeight ? { $gte: parseFloat(req.query.minHeight) } : {}),
          $lte: parseFloat(req.query.maxHeight)
        }
      }),
    };

    // Enforce pagination limits (already applied by middleware, but ensure here too)
    const requestedLimit = parseInt(req.query.limit) || 10;
    const requestedPage = parseInt(req.query.page) || 1;
    
    const options = {
      page: Math.min(requestedPage, 100), // Max page 100
      limit: Math.min(requestedLimit, 50), // Max 50 per page (middleware enforces this)
      // Exclude current user if authenticated
      excludeUserId: req.user ? req.user.id : null
    };

    const result = await userService.getAllUsers(filters, options);
    
    // Return only minimal data for search results to prevent scraping
    // Only includes: _id, gahoiId, name, age, gender, height, occupation, city, state, country, photos
    const minimalUsers = getMinimalUsersData(result.users);
    
    res.json({
      status: true,
      message: 'Users retrieved successfully',
      data: minimalUsers,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

