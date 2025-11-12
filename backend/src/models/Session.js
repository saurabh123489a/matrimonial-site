import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
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
    token: {
      type: String,
      required: true,
      unique: true,
      // Note: unique: true automatically creates an index
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for active sessions lookup
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export default mongoose.model('Session', sessionSchema);

