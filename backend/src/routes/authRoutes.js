import express from 'express';
import { login } from '../controllers/authController.js';
import { sendOTP, verifyOTP } from '../controllers/otpController.js';
import { validate, sendOTPSchema, verifyOTPSchema } from '../utils/validation.js';

const router = express.Router();

// OTP-based authentication routes
router.post('/send-otp', validate(sendOTPSchema), sendOTP);
router.post('/verify-otp', validate(verifyOTPSchema), verifyOTP);

// Legacy password-based login (optional - can be kept for backward compatibility)
router.post('/login', login);

export default router;


