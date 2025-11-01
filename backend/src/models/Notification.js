import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'shortlist',        // Someone shortlisted you
        'profile_view',      // Someone viewed your profile
        'interest_received', // Someone sent you interest
        'interest_accepted', // Someone accepted your interest
        'message_received',  // New message received
        'admin',            // Admin push notification
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      // Can reference Interest, Message, ProfileView, etc.
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    // For admin notifications
    isAdminNotification: {
      type: Boolean,
      default: false,
    },
    // Metadata for different notification types
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 });
notificationSchema.index({ isRead: false, createdAt: -1 }); // For unread count

export default mongoose.model('Notification', notificationSchema);

