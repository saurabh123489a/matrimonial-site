import { authService } from '../services/authService.js';
import { sessionRepository } from '../repositories/sessionRepository.js';
import { validate } from '../utils/validation.js';

export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const { token, user } = await authService.login(identifier, password, req);
    return res.json({ status: true, message: 'Login successful', data: { token, user } });
  } catch (err) {
    next(err);
  }
};

/**
 * Logout endpoint - Invalidates the current session
 */
export const logout = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.user?.sessionId;

    if (!userId || !sessionId) {
      return res.status(401).json({
        status: false,
        message: 'Not authenticated'
      });
    }

    // Invalidate the session
    const session = await sessionRepository.logout(sessionId, userId);
    
    if (!session) {
      return res.status(404).json({
        status: false,
        message: 'Session not found'
      });
    }

    return res.json({
      status: true,
      message: 'Logout successful'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Change password endpoint - Changes password and invalidates all sessions
 */
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({
        status: false,
        message: 'Not authenticated'
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const result = await authService.changePassword(userId, currentPassword, newPassword);

    return res.json({
      status: true,
      message: result.message
    });
  } catch (err) {
    next(err);
  }
};


