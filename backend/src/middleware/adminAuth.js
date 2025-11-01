import { userRepository } from '../repositories/userRepository.js';

/**
 * Admin Authentication Middleware
 * Checks if user is an admin
 */
export const requireAdmin = async (req, res, next) => {
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

    // Check if user is admin
    if (!user.isAdmin) {
      return res.status(403).json({
        status: false,
        message: 'Admin access required'
      });
    }

    // Attach full user object to request
    req.admin = user;
    next();
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: 'Error verifying admin access'
    });
  }
};

