import { horoscopeService } from '../services/horoscopeService.js';
import { userRepository } from '../repositories/userRepository.js';

/**
 * Calculate horoscope matching between current user and another user
 * GET /api/horoscope/match/:userId
 */
export const getHoroscopeMatch = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        status: false,
        message: 'User ID is required',
      });
    }
    
    // Get both user profiles
    const [currentUser, targetUser] = await Promise.all([
      userRepository.findById(currentUserId),
      userRepository.findById(userId),
    ]);
    
    if (!currentUser || !targetUser) {
      return res.status(404).json({
        status: false,
        message: 'User not found',
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
    next(error);
  }
};

