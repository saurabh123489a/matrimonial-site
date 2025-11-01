import { profileViewService } from '../services/profileViewService.js';

/**
 * Track profile view (called when viewing a profile)
 * POST /api/profile-views/track
 */
export const trackView = async (req, res, next) => {
  try {
    const viewerId = req.user ? req.user.id : null;
    const { viewedUserId } = req.body;

    if (!viewerId) {
      return res.status(401).json({
        status: false,
        message: 'Authentication required',
      });
    }

    if (!viewedUserId) {
      return res.status(400).json({
        status: false,
        message: 'viewedUserId is required',
      });
    }

    const view = await profileViewService.trackView(viewerId, viewedUserId);

    return res.json({
      status: true,
      message: 'View tracked successfully',
      data: view,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get profile views for current user
 * GET /api/profile-views/my-views
 */
export const getMyViews = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;

    if (!userId) {
      return res.status(401).json({
        status: false,
        message: 'Authentication required',
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const views = await profileViewService.getViews(userId, {
      skip: parseInt(skip),
      limit: parseInt(limit),
    });

    const count = await profileViewService.getViewCount(userId);

    return res.json({
      status: true,
      message: 'Views retrieved successfully',
      data: views,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

