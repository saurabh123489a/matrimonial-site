import Message from '../models/Message.js';
import mongoose from 'mongoose';
import { generateConversationId } from '../utils/conversationUtils.js';
import { sortPhotos } from '../utils/photoUtils.js';
import User from '../models/User.js';

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
   * Supports cursor-based pagination with 'before' parameter
   * @param {string|ObjectId} userId1 - First user ID
   * @param {string|ObjectId} userId2 - Second user ID
   * @param {Object} [options] - Query options
   * @param {number} [options.skip=0] - Number of messages to skip (for offset pagination)
   * @param {number} [options.limit=50] - Maximum number of messages to return
   * @param {string|Date} [options.before] - Cursor for pagination (message createdAt date)
   * @param {string} [options.sortBy='createdAt'] - Field to sort by
   * @param {number} [options.sortOrder=-1] - Sort order
   * @returns {Promise<Array|Object>} Array of message objects or object with messages, hasMore, nextCursor
   */
  async getConversation(userId1, userId2, options = {}) {
    const { skip = 0, limit = 50, before, sortBy = 'createdAt', sortOrder = -1 } = options;
    const conversationId = generateConversationId(userId1, userId2);

    // Build query
    const query = { conversationId };
    
    // Support cursor-based pagination
    if (before) {
      const beforeDate = before instanceof Date ? before : new Date(before);
      query.createdAt = { $lt: beforeDate };
    }

    // Fetch limit + 1 to check if more messages exist
    const fetchLimit = before ? limit + 1 : limit;
    
    // Get all messages in the conversation (both sent and received)
    const messages = await Message.find(query)
      .populate('senderId', 'name photos email phone')
      .populate('receiverId', 'name photos email phone')
      .sort({ [sortBy]: sortOrder })
      .skip(before ? 0 : skip) // Skip only for offset pagination
      .limit(fetchLimit)
      .lean(); // Use lean() for better performance

    // Collect all unique user IDs that need to be populated
    const userIds = new Set();
    messages.forEach(msg => {
      if (msg.senderId && typeof msg.senderId === 'string') {
        userIds.add(msg.senderId);
      }
      if (msg.receiverId && typeof msg.receiverId === 'string') {
        userIds.add(msg.receiverId);
      }
    });

    // Fetch all users in a single query (fixes N+1 problem)
    const users = userIds.size > 0
      ? await User.find({ _id: { $in: Array.from(userIds) } })
          .select('name photos email phone')
          .lean()
      : [];

    // Create a map for quick lookup
    const userMap = new Map(users.map(user => [String(user._id), user]));

    // Populate messages with user data and sort photos
    const populatedMessages = messages.map(msg => {
      // Populate sender if needed
      if (!msg.senderId || typeof msg.senderId === 'string') {
        const sender = userMap.get(String(msg.senderId));
        msg.senderId = sender || { _id: msg.senderId, name: 'Unknown' };
      }
      // Populate receiver if needed
      if (!msg.receiverId || typeof msg.receiverId === 'string') {
        const receiver = userMap.get(String(msg.receiverId));
        msg.receiverId = receiver || { _id: msg.receiverId, name: 'Unknown' };
      }

      // Sort photos if available
      if (msg.senderId?.photos) {
        sortPhotos(msg.senderId.photos);
      }
      if (msg.receiverId?.photos) {
        sortPhotos(msg.receiverId.photos);
      }

      return msg;
    });

    // If using cursor-based pagination, check if more messages exist
    if (before && populatedMessages.length > limit) {
      const result = populatedMessages.slice(0, limit);
      const oldestMessage = result[result.length - 1];
      return {
        messages: result.reverse(), // Reverse to show oldest first
        hasMore: true,
        nextCursor: oldestMessage?.createdAt || null,
      };
    }

    // For offset pagination or when no more messages, return array
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

    // Collect all unique user IDs that need to be populated (fixes N+1 problem)
    const userIds = new Set();
    conversations.forEach(conv => {
      const lastMsg = conv.lastMessage;
      if (lastMsg.senderId) userIds.add(String(lastMsg.senderId));
      if (lastMsg.receiverId) userIds.add(String(lastMsg.receiverId));
    });

    // Fetch all users in a single query
    const users = userIds.size > 0
      ? await User.find({ _id: { $in: Array.from(userIds) } })
          .select('name photos')
          .lean()
      : [];

    // Create a map for quick lookup
    const userMap = new Map(users.map(user => [String(user._id), user]));

    // Populate conversations with user data
    const currentUserIdStr = String(userId);
    const populated = conversations.map(conv => {
      const lastMsg = conv.lastMessage;
      const senderIdStr = String(lastMsg.senderId);
      const receiverIdStr = String(lastMsg.receiverId);

      // Determine the other user (not the current user)
      const otherUserId = senderIdStr === currentUserIdStr
        ? String(lastMsg.receiverId)
        : String(lastMsg.senderId);

      const otherUser = userMap.get(otherUserId);

      // Skip conversations where other user doesn't exist (deleted accounts)
      if (!otherUser) {
        return null;
      }

      // Sort photos if available
      if (otherUser.photos) {
        sortPhotos(otherUser.photos);
      }

      // Return senderId and receiverId as string IDs (not objects)
      // The frontend expects string IDs for comparison
      return {
        conversationId: conv._id,
        otherUser,
        lastMessage: {
          content: lastMsg.content,
          senderId: senderIdStr, // Always return as string ID
          receiverId: receiverIdStr, // Always return as string ID
          createdAt: lastMsg.createdAt,
          isRead: lastMsg.isRead || false,
          _id: lastMsg._id,
        },
        unreadCount: conv.unreadCount,
      };
    });

    // Filter out null values (conversations with deleted users)
    return populated.filter(conv => conv !== null);
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

    // Collect all unique user IDs that need to be populated (fixes N+1 problem)
    const userIds = new Set();
    messages.forEach(msg => {
      if (msg.senderId && typeof msg.senderId === 'string') {
        userIds.add(msg.senderId);
      }
      if (msg.receiverId && typeof msg.receiverId === 'string') {
        userIds.add(msg.receiverId);
      }
    });

    // Fetch all users in a single query
    const users = userIds.size > 0
      ? await User.find({ _id: { $in: Array.from(userIds) } })
          .select('name photos email phone')
          .lean()
      : [];

    // Create a map for quick lookup
    const userMap = new Map(users.map(user => [String(user._id), user]));

    // Populate messages with user data and sort photos
    const populatedMessages = messages.map(msg => {
      // Populate sender if needed
      if (!msg.senderId || typeof msg.senderId === 'string') {
        const sender = userMap.get(String(msg.senderId));
        msg.senderId = sender || { _id: msg.senderId, name: 'Unknown' };
      }
      // Populate receiver if needed
      if (!msg.receiverId || typeof msg.receiverId === 'string') {
        const receiver = userMap.get(String(msg.receiverId));
        msg.receiverId = receiver || { _id: msg.receiverId, name: 'Unknown' };
      }

      // Sort photos if available
      if (msg.senderId?.photos) {
        sortPhotos(msg.senderId.photos);
      }
      if (msg.receiverId?.photos) {
        sortPhotos(msg.receiverId.photos);
      }

      return msg;
    });

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

