import { otpService } from '../services/otpService.js';

/**
 * Send OTP to phone number
 * POST /api/auth/send-otp
 */
export const sendOTP = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        status: false,
        message: 'Phone number is required',
      });
    }

    const result = await otpService.sendOTP(phone);

    return res.json({
      status: true,
      message: result.message,
      data: {
        // Only include OTP in development mode
        ...(result.otp && { otp: result.otp }),
        message: 'OTP sent to your phone number',
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Verify OTP and login
 * POST /api/auth/verify-otp
 * Optional body: { phone, otp, name, gender } - name and gender are optional for new users
 */
export const verifyOTP = async (req, res, next) => {
  try {
    const { phone, otp, name, gender } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        status: false,
        message: 'Phone number and OTP code are required',
      });
    }

    // Pass optional user data (name, gender) for new user creation
    const userData = {};
    if (name) userData.name = name;
    if (gender && ['male', 'female', 'other'].includes(gender)) {
      userData.gender = gender;
    }

    const result = await otpService.verifyOTP(phone, otp, userData, req);

    return res.json({
      status: true,
      message: result.message || 'Login successful',
      data: {
        token: result.token,
        user: result.user,
      },
    });
  } catch (err) {
    next(err);
  }
};

