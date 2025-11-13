import Message from '../models/Message.js';
import mongoose from 'mongoose';
import { generateConversationId } from '../utils/conversationUtils.js';
import { sortPhotos } from '../utils/photoUtils.js';

export const messageRepository = {
  async create(data) {
    const { senderId, receiverId } = data;
    const conversationId = generateConversationId(senderId, receiverId);
    
    return await Message.create({
      ...data,
      conversationId,
    });
  },

  /**
   * Get conversation between two users
   * Returns messages sorted by creation date (newest first)
   * @param {string|ObjectId} userId1 - First user ID
   * @param {string|ObjectId} userId2 - Second user ID
   * @param {Object} [options] - Query options
   * @param {number} [options.skip=0] - Number of messages to skip
   * @param {number} [options.limit=50] - Maximum number of messages to return
   * @param {string} [options.sortBy='createdAt'] - Field to sort by
   * @param {number} [options.sortOrder=-1] - Sort order
   * @returns {Promise<Array>} Array of message objects with populated sender/receiver
   */
  async getConversation(userId1, userId2, options = {}) {
    const { skip = 0, limit = 50, sortBy = 'createdAt', sortOrder = -1 } = options;
    const conversationId = generateConversationId(userId1, userId2);

    // Get all messages in the conversation (both sent and received)
    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name photos email phone')
      .populate('receiverId', 'name photos email phone')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for better performance

    // Sort photos for each user
    const User = (await import('../models/User.js')).default;
    const populatedMessages = await Promise.all(
      messages.map(async (msg) => {
        // Ensure sender and receiver are populated
        if (!msg.senderId || typeof msg.senderId === 'string') {
          const sender = await User.findById(msg.senderId).select('name photos').lean();
          msg.senderId = sender || { _id: msg.senderId, name: 'Unknown' };
        }
        if (!msg.receiverId || typeof msg.receiverId === 'string') {
          const receiver = await User.findById(msg.receiverId).select('name photos').lean();
          msg.receiverId = receiver || { _id: msg.receiverId, name: 'Unknown' };
        }

        // Sort photos if available
        if (msg.senderId.photos) {
          sortPhotos(msg.senderId.photos);
        }
        if (msg.receiverId.photos) {
          sortPhotos(msg.receiverId.photos);
        }

        return msg;
      })
    );

    return populatedMessages;
  },

  /**
   * Get all conversations for a user
   * Returns list of conversations with last message and unread count
   * @param {string|ObjectId} userId - User ID
   * @param {Object} [options] - Query options
   * @param {number} [options.skip=0] - Number of conversations to skip
   * @param {number} [options.limit=20] - Maximum number of conversations to return
   * @returns {Promise<Array>} Array of conversation objects with last message and unread count
   */
  async getConversations(userId, options = {}) {
    const { skip = 0, limit = 20 } = options;

    // Convert userId to ObjectId for proper matching
    const userIdObj = new mongoose.Types.ObjectId(userId);

    // Get distinct conversations - include both sent and received messages
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: userIdObj },
            { receiverId: userIdObj }
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $eq: ['$receiverId', userIdObj] },
                { $cond: [{ $eq: ['$isRead', false] }, 1, 0] },
                0
              ],
            },
          },
        },
      },
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    // Populate user details for both sender and receiver
    const User = (await import('../models/User.js')).default;
    const populated = await Promise.all(
      conversations.map(async (conv) => {
        const lastMsg = conv.lastMessage;
        const senderIdStr = String(lastMsg.senderId);
        const receiverIdStr = String(lastMsg.receiverId);
        const currentUserIdStr = String(userId);

        // Determine the other user (not the current user)
        const otherUserId = senderIdStr === currentUserIdStr
          ? lastMsg.receiverId
          : lastMsg.senderId;

        const otherUser = await User.findById(otherUserId).select('name photos');

        // Populate sender and receiver for last message
        const populatedSender = senderIdStr === currentUserIdStr
          ? null // Don't populate current user
          : await User.findById(lastMsg.senderId).select('name photos').lean();
        const populatedReceiver = receiverIdStr === currentUserIdStr
          ? null // Don't populate current user
          : await User.findById(lastMsg.receiverId).select('name photos').lean();

        return {
          conversationId: conv._id,
          otherUser,
          lastMessage: {
            ...lastMsg,
            senderId: populatedSender || { _id: lastMsg.senderId, name: 'You' },
            receiverId: populatedReceiver || { _id: lastMsg.receiverId, name: 'You' },
          },
          unreadCount: conv.unreadCount,
        };
      })
    );

    return populated;
  },

  async markAsRead(messageId, userId) {
    return await Message.findOneAndUpdate(
      {
        _id: messageId,
        receiverId: userId,
        isRead: false,
      },
      {
        $set: { isRead: true, readAt: new Date() },
      },
      { new: true }
    );
  },

  async markConversationAsRead(conversationId, userId) {
    return await Message.updateMany(
      {
        conversationId,
        receiverId: userId,
        isRead: false,
      },
      {
        $set: { isRead: true, readAt: new Date() },
      }
    );
  },

  async getUnreadCount(userId) {
    return await Message.countDocuments({
      receiverId: userId,
      isRead: false,
    });
  },

  /**
   * Get all messages (Admin only)
   * Supports filtering and pagination
   */
  async getAllMessages(filters = {}, options = {}) {
    const { skip = 0, limit = 50, sortBy = 'createdAt', sortOrder = -1 } = options;

    const query = {};
    
    // Filter by sender/receiver if provided
    if (filters.senderId) {
      query.senderId = filters.senderId;
    }
    if (filters.receiverId) {
      query.receiverId = filters.receiverId;
    }
    if (filters.conversationId) {
      query.conversationId = filters.conversationId;
    }
    if (filters.search) {
      query.content = new RegExp(filters.search, 'i');
    }
    if (filters.isRead !== undefined) {
      query.isRead = filters.isRead;
    }
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }

    const messages = await Message.find(query)
      .populate('senderId', 'name photos email phone')
      .populate('receiverId', 'name photos email phone')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    // Ensure proper population and sort photos
    const User = (await import('../models/User.js')).default;
    const populatedMessages = await Promise.all(
      messages.map(async (msg) => {
        if (!msg.senderId || typeof msg.senderId === 'string') {
          const sender = await User.findById(msg.senderId).select('name photos email phone').lean();
          msg.senderId = sender || { _id: msg.senderId, name: 'Unknown' };
        }
        if (!msg.receiverId || typeof msg.receiverId === 'string') {
          const receiver = await User.findById(msg.receiverId).select('name photos email phone').lean();
          msg.receiverId = receiver || { _id: msg.receiverId, name: 'Unknown' };
        }

        // Sort photos if available
        if (msg.senderId.photos) {
          sortPhotos(msg.senderId.photos);
        }
        if (msg.receiverId.photos) {
          sortPhotos(msg.receiverId.photos);
        }

        return msg;
      })
    );

    return populatedMessages;
  },

  /**
   * Count all messages matching filters (Admin only)
   */
  async countAllMessages(filters = {}) {
    const query = {};
    
    if (filters.senderId) query.senderId = filters.senderId;
    if (filters.receiverId) query.receiverId = filters.receiverId;
    if (filters.conversationId) query.conversationId = filters.conversationId;
    if (filters.search) query.content = new RegExp(filters.search, 'i');
    if (filters.isRead !== undefined) query.isRead = filters.isRead;
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }

    return await Message.countDocuments(query);
  },
};

