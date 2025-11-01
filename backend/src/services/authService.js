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
        deviceInfo: deviceInfo.deviceInfo,
        status: 'success',
        sessionId: session._id,
      });
    }

    return { token, user: safeUser };
  },
};

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({}, secret, { subject: String(userId), expiresIn });
}


