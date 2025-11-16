import { messageRepository } from '../repositories/messageRepository.js';
import { notificationRepository } from '../repositories/notificationRepository.js';
import { profileViewRepository } from '../repositories/profileViewRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { sanitizeMessageContent } from '../utils/sanitize.js';
import { cacheService } from '../utils/cache.js';
import { generateConversationId } from '../utils/conversationUtils.js';
import { emitNewMessage, emitNotification } from './socketService.js';
import Message from '../models/Message.js';

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

    // Sanitize message content to prevent XSS attacks
    const sanitizedContent = sanitizeMessageContent(content);

    if (!sanitizedContent || sanitizedContent.trim().length === 0) {
      const error = new Error('Message content cannot be empty');
      error.status = 400;
      throw error;
    }

    // Create message
    const message = await messageRepository.create({
      senderId,
      receiverId,
      content: sanitizedContent,
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
        messagePreview: sanitizedContent.substring(0, 100),
      },
    });

    // Clear conversation cache for both users
    cacheService.clearConversationCache(senderId, receiverId);
    cacheService.clearUserConversationsCache(senderId);
    cacheService.clearUserConversationsCache(receiverId);

    // Populate sender/receiver for response
    const populatedMessage = await messageRepository.getConversation(senderId, receiverId, {
      limit: 1,
      sortBy: 'createdAt',
      sortOrder: -1,
    }).then(messages => messages[0]);

    // Emit new message via WebSocket
    emitNewMessage(senderId, receiverId, populatedMessage);

    // Emit notification via WebSocket
    emitNotification(receiverId, {
      type: 'message_received',
      title: 'New Message',
      message: `${sender.name} sent you a message`,
      relatedUserId: senderId,
      relatedId: message._id,
    });

    return populatedMessage;
  },

  /**
   * Get conversation between two users
   * Uses caching to improve performance
   */
  async getConversation(userId1, userId2, options = {}) {
    // Create cache key based on conversation ID and options
    const conversationId = generateConversationId(userId1, userId2);
    const { skip = 0, limit = 50, sortBy = 'createdAt', sortOrder = -1 } = options;
    const cacheKey = `conversation:${conversationId}:skip:${skip}:limit:${limit}:sortBy:${sortBy}:sortOrder:${sortOrder}`;
    
    // Try to get from cache first
    const cached = cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const messages = await messageRepository.getConversation(userId1, userId2, options);
    
    // Cache the result (5 minutes TTL - shorter than user profiles since messages change more frequently)
    cacheService.set(cacheKey, messages, 300);
    
    return messages;
  },

  /**
   * Get all conversations for a user
   * Uses caching to improve performance
   */
  async getConversations(userId, options = {}) {
    // Create cache key based on user ID and options
    const { skip = 0, limit = 20 } = options;
    const cacheKey = `conversations:${userId}:skip:${skip}:limit:${limit}`;
    
    // Try to get from cache first
    const cached = cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const conversations = await messageRepository.getConversations(userId, options);
    
    // Cache the result (5 minutes TTL)
    cacheService.set(cacheKey, conversations, 300);
    
    return conversations;
  },

  /**
   * Mark message as read
   */
  async markAsRead(messageId, userId) {
    const result = await messageRepository.markAsRead(messageId, userId);
    
    // Clear conversation cache to refresh unread counts
    // Note: We need to get the message to find the conversation participants
    const message = await Message.findById(messageId).lean();
    if (message) {
      cacheService.clearConversationCache(message.senderId, message.receiverId);
      cacheService.clearUserConversationsCache(message.senderId);
      cacheService.clearUserConversationsCache(message.receiverId);
    }
    
    return result;
  },

  /**
   * Mark entire conversation as read
   */
  async markConversationAsRead(userId1, userId2, userId) {
    // Use the same conversation ID generation logic as repository
    const ids = [String(userId1), String(userId2)].sort();
    const conversationId = `${ids[0]}_${ids[1]}`;
    const result = await messageRepository.markConversationAsRead(conversationId, userId);
    
    // Clear conversation cache to refresh unread counts
    cacheService.clearConversationCache(userId1, userId2);
    cacheService.clearUserConversationsCache(userId1);
    cacheService.clearUserConversationsCache(userId2);
    
    return result;
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

