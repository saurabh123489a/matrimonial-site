import mongoose from 'mongoose';

const userBadgeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    badgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge',
      required: true,
      index: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    reason: {
      type: String,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique constraint: one badge assignment per user per badge
userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });
userBadgeSchema.index({ userId: 1, isVisible: 1 });

export default mongoose.model('UserBadge', userBadgeSchema);

