import { messageService } from '../services/messageService.js';

/**
 * Send a message
 * POST /api/messages/send
 */
export const sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user ? req.user.id : null;
    const { receiverId, content } = req.body;

    if (!senderId) {
      return res.status(401).json({
        status: false,
        message: 'Authentication required',
      });
    }

    if (!receiverId || !content) {
      return res.status(400).json({
        status: false,
        message: 'receiverId and content are required',
      });
    }

    const message = await messageService.sendMessage(senderId, receiverId, content);

    return res.json({
      status: true,
      message: 'Message sent successfully',
      data: message,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get conversation between two users
 * GET /api/messages/conversation/:userId
 */
export const getConversation = async (req, res, next) => {
  try {
    const userId1 = req.user ? req.user.id : null;
    const { userId: userId2 } = req.params;

    if (!userId1) {
      return res.status(401).json({
        status: false,
        message: 'Authentication required',
      });
    }

    const { page, limit = 50, before } = req.query;
    
    // Support both offset and cursor-based pagination
    const options = {
      limit: parseInt(limit),
    };
    
    if (before) {
      // Cursor-based pagination
      options.before = before;
    } else if (page) {
      // Offset-based pagination (backward compatibility)
      const skip = (parseInt(page) - 1) * parseInt(limit);
      options.skip = skip;
    }

    const result = await messageService.getConversation(userId1, userId2, options);

    // Handle paginated response (object) vs array response
    if (result && typeof result === 'object' && !Array.isArray(result)) {
      return res.json({
        status: true,
        message: 'Conversation retrieved successfully',
        data: result.messages,
        hasMore: result.hasMore,
        nextCursor: result.nextCursor,
      });
    }

    return res.json({
      status: true,
      message: 'Conversation retrieved successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all conversations for current user
 * GET /api/messages/conversations
 */
export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;

    if (!userId) {
      return res.status(401).json({
        status: false,
        message: 'Authentication required',
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const conversations = await messageService.getConversations(userId, {
      skip: parseInt(skip),
      limit: parseInt(limit),
    });

    const unreadCount = await messageService.getUnreadCount(userId);

    return res.json({
      status: true,
      message: 'Conversations retrieved successfully',
      data: conversations,
      unreadCount,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Mark conversation as read
 * POST /api/messages/conversation/:userId/read
 */
export const markConversationAsRead = async (req, res, next) => {
  try {
    const userId1 = req.user ? req.user.id : null;
    const { userId: userId2 } = req.params;

    if (!userId1) {
      return res.status(401).json({
        status: false,
        message: 'Authentication required',
      });
    }

    await messageService.markConversationAsRead(userId1, userId2, userId1);

    return res.json({
      status: true,
      message: 'Conversation marked as read',
    });
  } catch (err) {
    next(err);
  }
};

