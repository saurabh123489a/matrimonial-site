import { adminService } from '../services/adminService.js';
import { notificationService } from '../services/notificationService.js';
import { userService } from '../services/userService.js';

/**
 * Admin Controller - Handles admin operations
 */

/**
 * Send global notification to all users
 * POST /api/admin/notifications/global
 */
export const sendGlobalNotification = async (req, res, next) => {
  try {
    const { title, message, metadata } = req.body;
    const adminId = req.user.id;

    if (!title || !message) {
      return res.status(400).json({
        status: false,
        message: 'Title and message are required'
      });
    }

    const result = await notificationService.sendAdminNotification(title, message, metadata);

    res.json({
      status: true,
      message: 'Global notification sent successfully',
      data: { count: result.length }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send personal notification to specific user
 * POST /api/admin/notifications/personal
 */
export const sendPersonalNotification = async (req, res, next) => {
  try {
    const { userId, title, message, metadata } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({
        status: false,
        message: 'UserId, title, and message are required'
      });
    }

    const notification = await notificationService.createNotification({
      userId,
      type: 'admin',
      title,
      message,
      isAdminNotification: true,
      metadata: { ...metadata, sentByAdmin: true }
    });

    res.json({
      status: true,
      message: 'Personal notification sent successfully',
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users with filters (Admin)
 * GET /api/admin/users
 */
export const getAllUsersAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, isActive, gender, status } = req.query;
    
    const filters = {};
    if (search) {
      filters.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') }
      ];
    }
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (gender) filters.gender = gender;
    if (status === 'active') filters.isActive = true;
    if (status === 'inactive') filters.isActive = false;

    const result = await userService.getAllUsers(filters, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.json({
      status: true,
      message: 'Users retrieved successfully',
      data: result.users,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile (Admin)
 * PATCH /api/admin/users/:id
 */
export const updateUserAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Allow admin to update any field including isActive and isAdmin
    const updatedUser = await userService.updateUserProfile(id, updateData);

    res.json({
      status: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user (Admin) - Soft delete
 * DELETE /api/admin/users/:id
 */
export const deleteUserAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await userService.deleteUserProfile(id);

    res.json({
      status: true,
      message: 'User deleted successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create admin user
 * POST /api/admin/users/create-admin
 */
export const createAdminUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, gender } = req.body;

    if (!name || !gender || !password) {
      return res.status(400).json({
        status: false,
        message: 'Name, gender, and password are required'
      });
    }

    if (!email && !phone) {
      return res.status(400).json({
        status: false,
        message: 'Either email or phone is required'
      });
    }

    const userData = {
      name,
      email,
      phone,
      password,
      gender,
      isAdmin: true, // Set admin flag
      isActive: true,
    };

    const user = await userService.createUser(userData);

    res.status(201).json({
      status: true,
      message: 'Admin user created successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get dashboard stats
 * GET /api/admin/dashboard/stats
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();

    res.json({
      status: true,
      message: 'Dashboard stats retrieved successfully',
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all messages (Admin only)
 * GET /api/admin/messages
 */
export const getAllMessagesAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search, senderId, receiverId, conversationId, isRead, startDate, endDate } = req.query;
    
    const filters = {};
    if (search) filters.search = search;
    if (senderId) filters.senderId = senderId;
    if (receiverId) filters.receiverId = receiverId;
    if (conversationId) filters.conversationId = conversationId;
    if (isRead !== undefined) filters.isRead = isRead === 'true';
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const { messageService } = await import('../services/messageService.js');
    const [messages, total] = await Promise.all([
      messageService.getAllMessages(filters, {
        skip,
        limit: parseInt(limit),
        sortBy: 'createdAt',
        sortOrder: -1,
      }),
      messageService.countAllMessages(filters),
    ]);

    res.json({
      status: true,
      message: 'Messages retrieved successfully',
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get login logs (Admin only)
 * GET /api/admin/login-logs
 */
export const getLoginLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, userId, status, source, loginMethod, startDate, endDate, search } = req.query;
    
    const { loginLogRepository } = await import('../repositories/loginLogRepository.js');
    
    const filters = {};
    if (userId) filters.userId = userId;
    if (status) filters.status = status;
    if (source) filters.source = source;
    if (loginMethod) filters.loginMethod = loginMethod;
    
    // Date range filter
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }
    
    // Search filter (by name)
    if (search) {
      filters.name = new RegExp(search, 'i');
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      loginLogRepository.findWithFilters(filters, {
        skip,
        limit: parseInt(limit),
        sortBy: 'createdAt',
        sortOrder: -1,
      }),
      loginLogRepository.count(filters),
    ]);

    res.json({
      status: true,
      message: 'Login logs retrieved successfully',
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

