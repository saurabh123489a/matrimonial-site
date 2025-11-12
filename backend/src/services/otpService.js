import jwt from 'jsonwebtoken';
import { otpRepository } from '../repositories/otpRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { sessionRepository } from '../repositories/sessionRepository.js';
import { loginLogRepository } from '../repositories/loginLogRepository.js';
import { getDeviceInfo } from '../utils/deviceInfo.js';

// Default OTP - Currently using fixed OTP for all users
// TODO: In future, integrate SMS API (Twilio, AWS SNS, etc.) to send actual OTP codes
const DEFAULT_OTP = '123456';

/**
 * Generate OTP code
 * Currently returns fixed OTP (123456) for all users
 * Future: Will integrate with SMS API to send unique OTP codes
 */
function generateOTP() {
  // Currently always return default OTP
  // In future, when SMS API is integrated, this will generate random OTP:
  // return Math.floor(100000 + Math.random() * 900000).toString();
  return DEFAULT_OTP;
}

/**
 * Send OTP to phone number
 */
export const otpService = {
  async sendOTP(phone) {
    // Validate phone format (basic validation)
    if (!phone || phone.length < 10) {
      const error = new Error('Invalid phone number');
      error.status = 400;
      throw error;
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phone.replace(/\D/g, '');

    // Generate OTP
    const code = generateOTP();

    // Set expiration (5 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // Delete any existing unused OTPs for this phone (optional - you can keep multiple)
    // await otpRepository.deleteExpired();

    // Create new OTP
    const otp = await otpRepository.create({
      phone: cleanPhone,
      code,
      expiresAt,
    });

    // TODO: In future, send SMS here using a service like Twilio, AWS SNS, etc.
    // Currently: OTP is always 123456 for testing
    // Future implementation example:
    // await smsService.sendOTP(cleanPhone, code);
    console.log(`📱 OTP sent to ${cleanPhone}: ${code} (Currently using default: ${code})`);
    
    return {
      success: true,
      message: 'OTP sent successfully',
      // Include OTP in response for testing (will be removed when SMS API is integrated)
      otp: code,
    };
  },

  async verifyOTP(phone, code, userData = {}, req = null) {
    // Validate inputs
    if (!phone || !code) {
      const error = new Error('Phone number and OTP code are required');
      error.status = 400;
      throw error;
    }

    const cleanPhone = phone.replace(/\D/g, '');

    // Find valid OTP
    const otp = await otpRepository.findByPhoneAndCode(cleanPhone, code);

    if (!otp) {
      // Log failed OTP verification
      if (req) {
        const deviceInfo = getDeviceInfo(req);
        const existingUser = await userRepository.findByPhone(cleanPhone);
        await loginLogRepository.create({
          userId: existingUser?._id || null,
          name: existingUser?.name || cleanPhone,
          userType: existingUser?.isAdmin ? 'admin' : 'user',
          loginMethod: 'otp',
          device: deviceInfo.device,
          source: deviceInfo.source,
          deviceInfo: deviceInfo.deviceInfo,
          status: 'failed',
          failureReason: 'Invalid or expired OTP',
        });
      }

      // Increment attempts for failed verification
      const recentOTPs = await otpRepository.findByPhone(cleanPhone);
      if (recentOTPs.length > 0) {
        await otpRepository.incrementAttempts(recentOTPs[0]._id);
      }

      const error = new Error('Invalid or expired OTP');
      error.status = 401;
      throw error;
    }

    // Mark OTP as used
    await otpRepository.markAsUsed(otp._id);

    // Find or create user
    let user = await userRepository.findByPhone(cleanPhone);

    if (!user) {
      // Create new user if doesn't exist (phone-only registration)
      // Gender is required - use provided gender or default to 'male' if not provided
      const gender = userData.gender || 'male';
      const name = userData.name || `User ${cleanPhone.slice(-4)}`;
      
      const newUser = {
        phone: cleanPhone,
        name: name,
        gender: gender, // Required field
        passwordHash: '', // No password needed for OTP auth
        isActive: true,
        isProfileComplete: false,
      };
      
      user = await userRepository.create(newUser);
    }

    // Generate JWT token
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
        loginMethod: 'otp',
        device: deviceInfo.device,
        source: deviceInfo.source,
        deviceInfo: deviceInfo.deviceInfo,
        status: 'success',
        sessionId: session._id,
      });
    }

    return {
      token,
      user: safeUser,
      message: 'OTP verified successfully',
    };
  },
};

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({}, secret, { subject: String(userId), expiresIn });
}

