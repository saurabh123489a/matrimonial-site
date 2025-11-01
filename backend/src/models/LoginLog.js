import mongoose from 'mongoose';

const loginLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      index: true,
    },
    loginMethod: {
      type: String,
      enum: ['password', 'otp', 'token'],
      required: true,
      index: true,
    },
    device: {
      type: String,
      required: true,
    },
    deviceInfo: {
      userAgent: String,
      platform: String,
      browser: String,
      ipAddress: String,
      location: String,
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'blocked'],
      required: true,
      index: true,
    },
    failureReason: {
      type: String,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
    },
  },
  {
    timestamps: true,
  }
);

// Index for user login history
loginLogSchema.index({ userId: 1, createdAt: -1 });
loginLogSchema.index({ createdAt: -1 });

export default mongoose.model('LoginLog', loginLogSchema);

