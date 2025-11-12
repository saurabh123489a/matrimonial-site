import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String, // Emoji or icon identifier
      required: true,
    },
    color: {
      type: String, // Hex color code
      default: '#FFD700', // Gold default
    },
    category: {
      type: String,
      enum: ['achievement', 'verification', 'community', 'activity', 'special'],
      default: 'achievement',
    },
    criteria: {
      type: mongoose.Schema.Types.Mixed, // Flexible criteria object
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isAutoAssigned: {
      type: Boolean,
      default: false, // If true, system automatically assigns based on criteria
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
badgeSchema.index({ isActive: 1, category: 1 });
badgeSchema.index({ name: 1 });

export default mongoose.model('Badge', badgeSchema);

