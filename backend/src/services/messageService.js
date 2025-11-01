import { messageRepository } from '../repositories/messageRepository.js';
import { notificationRepository } from '../repositories/notificationRepository.js';
import { profileViewRepository } from '../repositories/profileViewRepository.js';
import { userRepository } from '../repositories/userRepository.js';

export const messageService = {
  /**
   * Send a message from one user to another
   */
  async sendMessage(senderId, receiverId, content) {
    // Validate users exist
    const sender = await userRepository.findById(senderId);
    const receiver = await userRepository.findById(receiverId);

    if (!sender || !receiver) {
      const error = new Error('Sender or receiver not found');
      error.status = 404;
      throw error;
    }

    // Create message
    const message = await messageRepository.create({
      senderId,
      receiverId,
      content,
    });

    // Mark as messaged in profile views (if exists)
    await profileViewRepository.markAsMessaged(senderId, receiverId);

    // Create notification for receiver
    await notificationRepository.create({
      userId: receiverId,
      type: 'message_received',
      title: 'New Message',
      message: `${sender.name} sent you a message`,
      relatedUserId: senderId,
      relatedId: message._id,
      metadata: {
        messagePreview: content.substring(0, 100),
      },
    });

    // Populate sender/receiver for response
    return await messageRepository.getConversation(senderId, receiverId, {
      limit: 1,
      sortBy: 'createdAt',
      sortOrder: -1,
    }).then(messages => messages[0]);
  },

  /**
   * Get conversation between two users
   */
  async getConversation(userId1, userId2, options = {}) {
    return await messageRepository.getConversation(userId1, userId2, options);
  },

  /**
   * Get all conversations for a user
   */
  async getConversations(userId, options = {}) {
    return await messageRepository.getConversations(userId, options);
  },

  /**
   * Mark message as read
   */
  async markAsRead(messageId, userId) {
    return await messageRepository.markAsRead(messageId, userId);
  },

  /**
   * Mark entire conversation as read
   */
  async markConversationAsRead(userId1, userId2, userId) {
    // Use the same conversation ID generation logic as repository
    const ids = [String(userId1), String(userId2)].sort();
    const conversationId = `${ids[0]}_${ids[1]}`;
    return await messageRepository.markConversationAsRead(conversationId, userId);
  },

  /**
   * Get unread message count
   */
  async getUnreadCount(userId) {
    return await messageRepository.getUnreadCount(userId);
  },

  /**
   * Get all messages (Admin only)
   */
  async getAllMessages(filters = {}, options = {}) {
    return await messageRepository.getAllMessages(filters, options);
  },

  /**
   * Count all messages (Admin only)
   */
  async countAllMessages(filters = {}) {
    return await messageRepository.countAllMessages(filters);
  },
};

