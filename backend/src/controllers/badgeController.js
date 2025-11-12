import { badgeService } from '../services/badgeService.js';

/**
 * Create a new badge (Admin only)
 * POST /api/badges
 */
export const createBadge = async (req, res, next) => {
  try {
    const badge = await badgeService.createBadge(req.body);
    res.status(201).json({
      status: true,
      message: 'Badge created successfully',
      data: badge,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all badges
 * GET /api/badges
 */
export const getBadges = async (req, res, next) => {
  try {
    const { isActive } = req.query;
    const filters = {};
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const badges = await badgeService.getBadges(filters);
    res.json({
      status: true,
      message: 'Badges retrieved successfully',
      data: badges,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active badges
 * GET /api/badges/active
 */
export const getActiveBadges = async (req, res, next) => {
  try {
    const badges = await badgeService.getActiveBadges();
    res.json({
      status: true,
      message: 'Active badges retrieved successfully',
      data: badges,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign badge to user (Admin only)
 * POST /api/badges/:badgeId/assign/:userId
 */
export const assignBadge = async (req, res, next) => {
  try {
    const { badgeId, userId } = req.params;
    const assignedBy = req.user.id;
    const { reason } = req.body;
    const userBadge = await badgeService.assignBadgeToUser(userId, badgeId, assignedBy, reason);
    res.json({
      status: true,
      message: 'Badge assigned successfully',
      data: userBadge,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user badges
 * GET /api/badges/user/:userId
 */
export const getUserBadges = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const badges = await badgeService.getUserBadges(userId);
    res.json({
      status: true,
      message: 'User badges retrieved successfully',
      data: badges,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove badge from user (Admin only)
 * DELETE /api/badges/:badgeId/user/:userId
 */
export const removeBadge = async (req, res, next) => {
  try {
    const { badgeId, userId } = req.params;
    await badgeService.removeBadgeFromUser(userId, badgeId);
    res.json({
      status: true,
      message: 'Badge removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update badge (Admin only)
 * PATCH /api/badges/:id
 */
export const updateBadge = async (req, res, next) => {
  try {
    const { id } = req.params;
    const badge = await badgeService.updateBadge(id, req.body);
    res.json({
      status: true,
      message: 'Badge updated successfully',
      data: badge,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete badge (Admin only)
 * DELETE /api/badges/:id
 */
export const deleteBadge = async (req, res, next) => {
  try {
    const { id } = req.params;
    await badgeService.deleteBadge(id);
    res.json({
      status: true,
      message: 'Badge deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

