import mongoose from 'mongoose';

const pollOptionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  votes: {
    type: Number,
    default: 0,
  },
}, { _id: true });

const pollSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    options: {
      type: [pollOptionSchema],
      required: true,
      validate: {
        validator: function(v) {
          return v && v.length >= 2;
        },
        message: 'Poll must have at least 2 options',
      },
    },
    category: {
      type: String,
      enum: ['general', 'community', 'platform', 'feature', 'other'],
      default: 'general',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    allowMultipleVotes: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
    },
    totalVotes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
pollSchema.index({ isActive: 1, createdAt: -1 });
pollSchema.index({ createdBy: 1, createdAt: -1 });
pollSchema.index({ category: 1, isActive: 1 });

export default mongoose.model('Poll', pollSchema);

