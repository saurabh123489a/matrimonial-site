import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    // For message threads/conversations
    conversationId: {
      type: String,
      index: true,
      // Format: "userId1_userId2" (sorted to ensure same conversation)
    },
  },
  {
    timestamps: true,
  }
);

// Index for getting messages in a conversation
messageSchema.index({ conversationId: 1, createdAt: -1 });
// Index for unread messages
messageSchema.index({ receiverId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model('Message', messageSchema);

