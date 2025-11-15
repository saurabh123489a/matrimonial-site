import express from 'express';
import { login, logout, changePassword } from '../controllers/authController.js';
import { sendOTP, verifyOTP } from '../controllers/otpController.js';
import { validate, sendOTPSchema, verifyOTPSchema } from '../utils/validation.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// OTP-based authentication routes
router.post('/send-otp', validate(sendOTPSchema), sendOTP);
router.post('/verify-otp', validate(verifyOTPSchema), verifyOTP);

// Legacy password-based login (optional - can be kept for backward compatibility)
router.post('/login', login);

// Logout route (requires authentication)
router.post('/logout', requireAuth, logout);

// Change password route (requires authentication)
router.post('/change-password', requireAuth, changePassword);

export default router;


