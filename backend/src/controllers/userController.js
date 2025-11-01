import { userService } from '../services/userService.js';
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
      ...(req.query.religion && { religion: new RegExp(req.query.religion, 'i') }),
      ...(req.query.caste && { caste: new RegExp(req.query.caste, 'i') }),
      ...(req.query.subCaste && { subCaste: new RegExp(req.query.subCaste, 'i') }),
      ...(req.query.education && { education: new RegExp(req.query.education, 'i') }),
      ...(req.query.occupation && { occupation: new RegExp(req.query.occupation, 'i') }),
      ...(req.query.maritalStatus && { maritalStatus: req.query.maritalStatus }),
      ...(req.query.minHeight && { height: { $gte: parseInt(req.query.minHeight) } }),
      ...(req.query.maxHeight && { 
        height: { 
          ...(req.query.minHeight ? { $gte: parseInt(req.query.minHeight) } : {}),
          $lte: parseInt(req.query.maxHeight)
        }
      }),
    };

    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      // Exclude current user if authenticated
      excludeUserId: req.user ? req.user.id : null
    };

    const result = await userService.getAllUsers(filters, options);
    
    res.json({
      status: true,
      message: 'Users retrieved successfully',
      data: result.users,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

