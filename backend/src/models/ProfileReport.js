import mongoose from 'mongoose';

/**
 * Profile Report Model
 * Tracks reports/flags on user profiles by community members
 */
const profileReportSchema = new mongoose.Schema(
  {
    reportedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      enum: [
        'inappropriate-content',
        'fake-profile',
        'misleading-information',
        'harassment',
        'spam',
        'other'
      ],
    },
    description: {
      type: String,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    adminNotes: {
      type: String,
      maxlength: 1000,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
profileReportSchema.index({ status: 1, createdAt: -1 });
profileReportSchema.index({ reportedUserId: 1, reportedBy: 1 });

// Prevent duplicate reports from same user on same profile
profileReportSchema.index({ reportedUserId: 1, reportedBy: 1 }, { unique: true });

export default mongoose.model('ProfileReport', profileReportSchema);

