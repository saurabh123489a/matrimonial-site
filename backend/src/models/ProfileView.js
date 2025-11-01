import mongoose from 'mongoose';

const profileViewSchema = new mongoose.Schema(
  {
    viewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    viewedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    // Track if viewer has already sent a message (to avoid duplicate notifications)
    hasMessaged: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate views in short time (e.g., same user viewing within 1 hour)
// One index for quick lookups
profileViewSchema.index({ viewerId: 1, viewedUserId: 1, viewedAt: -1 });
// Index for getting views of a specific user
profileViewSchema.index({ viewedUserId: 1, viewedAt: -1 });

export default mongoose.model('ProfileView', profileViewSchema);

