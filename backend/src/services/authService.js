import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/userRepository.js';
import { sessionRepository } from '../repositories/sessionRepository.js';
import { loginLogRepository } from '../repositories/loginLogRepository.js';
import { getDeviceInfo } from '../utils/deviceInfo.js';

export const authService = {
  async login(identifier, password, req = null) {
    const user = await userRepository.findByEmailOrPhone(identifier);
    if (!user) {
      // Log failed login attempt
      if (req) {
        const deviceInfo = getDeviceInfo(req);
        await loginLogRepository.create({
          userId: null,
          name: identifier,
          userType: 'user',
          loginMethod: 'password',
          device: deviceInfo.device,
          source: deviceInfo.source,
          deviceInfo: deviceInfo.deviceInfo,
          status: 'failed',
          failureReason: 'User not found',
        });
      }
      const error = new Error('Invalid credentials');
      error.status = 401;
      throw error;
    }
    
    const ok = await bcrypt.compare(password, user.passwordHash || '');
    if (!ok) {
      // Log failed login attempt
      if (req) {
        const deviceInfo = getDeviceInfo(req);
        await loginLogRepository.create({
          userId: user._id,
          name: user.name,
          userType: user.isAdmin ? 'admin' : 'user',
          loginMethod: 'password',
          device: deviceInfo.device,
          source: deviceInfo.source,
          deviceInfo: deviceInfo.deviceInfo,
          status: 'failed',
          failureReason: 'Invalid password',
        });
      }
      const error = new Error('Invalid credentials');
      error.status = 401;
      throw error;
    }

    // Generate token
    const token = signToken(user._id);
    const safeUser = await userRepository.findById(user._id);

    // Create session and login log
    if (req) {
      const deviceInfo = getDeviceInfo(req);
      const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
      const expiresAt = new Date();
      // Parse expiresIn (e.g., '7d', '24h', '30m')
      if (expiresIn.endsWith('d')) {
        expiresAt.setDate(expiresAt.getDate() + parseInt(expiresIn));
      } else if (expiresIn.endsWith('h')) {
        expiresAt.setHours(expiresAt.getHours() + parseInt(expiresIn));
      } else if (expiresIn.endsWith('m')) {
        expiresAt.setMinutes(expiresAt.getMinutes() + parseInt(expiresIn));
      } else {
        expiresAt.setDate(expiresAt.getDate() + 7); // Default 7 days
      }

      const session = await sessionRepository.create({
        userId: user._id,
        name: user.name,
        userType: user.isAdmin ? 'admin' : 'user',
        device: deviceInfo.device,
        deviceInfo: deviceInfo.deviceInfo,
        token,
        expiresAt,
        isActive: true,
        lastActivity: new Date(),
      });

      // Create login log
      await loginLogRepository.create({
        userId: user._id,
        name: user.name,
        userType: user.isAdmin ? 'admin' : 'user',
        loginMethod: 'password',
        device: deviceInfo.device,
        source: deviceInfo.source,
        deviceInfo: deviceInfo.deviceInfo,
        status: 'success',
        sessionId: session._id,
      });
    }

    return { token, user: safeUser };
  },

  /**
   * Change user password and invalidate all sessions
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Updated user
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    // Verify current password
    if (user.passwordHash) {
      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        const error = new Error('Current password is incorrect');
        error.status = 401;
        throw error;
      }
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await userRepository.update(userId, { passwordHash: newPasswordHash });

    // Invalidate all active sessions for this user
    await sessionRepository.deactivateAllUserSessions(userId);

    return { message: 'Password changed successfully. All sessions have been invalidated.' };
  },
};

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({}, secret, { subject: String(userId), expiresIn });
}


