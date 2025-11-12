import { horoscopeService } from '../services/horoscopeService.js';
import { userRepository } from '../repositories/userRepository.js';

/**
 * Calculate horoscope matching between current user and another user
 * GET /api/horoscope/match/:userId
 */
export const getHoroscopeMatch = async (req, res, next) => {
  try {
    const currentUserId = req.user?.id;
    const { userId } = req.params;
    
    if (!currentUserId) {
      return res.status(401).json({
        status: false,
        message: 'Authentication required',
      });
    }
    
    if (!userId) {
      return res.status(400).json({
        status: false,
        message: 'User ID is required',
      });
    }
    
    // Prevent matching with self
    if (currentUserId === userId) {
      return res.status(400).json({
        status: false,
        message: 'Cannot calculate horoscope match with yourself',
      });
    }
    
    // Get both user profiles
    const [currentUser, targetUser] = await Promise.all([
      userRepository.findById(currentUserId),
      userRepository.findById(userId),
    ]);
    
    if (!currentUser) {
      return res.status(404).json({
        status: false,
        message: 'Your profile not found',
      });
    }
    
    if (!targetUser) {
      return res.status(404).json({
        status: false,
        message: 'Target user profile not found',
      });
    }
    
    // Calculate matching
    const matching = await horoscopeService.calculateMatching(currentUser, targetUser);
    
    res.json({
      status: true,
      message: 'Horoscope matching calculated successfully',
      data: matching,
    });
  } catch (error) {
    console.error('Horoscope match error:', error);
    next(error);
  }
};

