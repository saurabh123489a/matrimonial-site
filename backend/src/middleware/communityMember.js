import { userRepository } from '../repositories/userRepository.js';

/**
 * Community Member Middleware
 * Checks if user has a community position (allows reporting)
 */
export const requireCommunityPosition = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        status: false,
        message: 'Authentication required'
      });
    }

    const user = await userRepository.findById(req.user.id);
    
    if (!user) {
      return res.status(401).json({
        status: false,
        message: 'User not found'
      });
    }

    // Check if user has a community position
    if (!user.communityPosition) {
      return res.status(403).json({
        status: false,
        message: 'You must have a community position to perform this action'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: 'Error verifying community position'
    });
  }
};

