import { reportService } from '../services/reportService.js';
import { reportSchema } from '../utils/validation.js';

/**
 * Report Controller - Handles profile reporting/flagging
 */

/**
 * Report a profile
 * POST /api/reports
 * Requires: User must have a community position
 */
export const reportProfile = async (req, res, next) => {
  try {
    const reporterId = req.user.id;
    const { reportedUserId, reason, description } = req.body;

    // Validate request body
    try {
      reportSchema.parse({ reportedUserId, reason, description });
    } catch (validationError) {
      if (validationError.errors) {
        return res.status(400).json({
          status: false,
          message: 'Validation error',
          errors: validationError.errors
        });
      }
      return res.status(400).json({
        status: false,
        message: 'Validation error',
        errors: validationError.errors || [{ message: 'Invalid request data' }]
      });
    }

    const report = await reportService.createReport({
      reportedUserId,
      reportedBy: reporterId,
      reason,
      description,
    });

    res.status(201).json({
      status: true,
      message: 'Profile reported successfully',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all reports (Admin only)
 * GET /api/reports
 */
export const getAllReports = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const filters = {};
    if (status) {
      filters.status = status;
    }

    const result = await reportService.getAllReports(filters, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.json({
      status: true,
      message: 'Reports retrieved successfully',
      data: result.reports,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific report (Admin only)
 * GET /api/reports/:id
 */
export const getReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await reportService.getReportById(id);

    if (!report) {
      return res.status(404).json({
        status: false,
        message: 'Report not found'
      });
    }

    res.json({
      status: true,
      message: 'Report retrieved successfully',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update report status (Admin only)
 * PATCH /api/reports/:id
 */
export const updateReportStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    const adminId = req.user.id;

    if (!status) {
      return res.status(400).json({
        status: false,
        message: 'Status is required'
      });
    }

    const report = await reportService.updateReportStatus(id, {
      status,
      adminNotes,
      reviewedBy: adminId,
    });

    res.json({
      status: true,
      message: 'Report status updated successfully',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get reports for a specific user profile
 * GET /api/reports/user/:userId
 */
export const getUserReports = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const reports = await reportService.getReportsByUserId(userId);

    res.json({
      status: true,
      message: 'User reports retrieved successfully',
      data: reports
    });
  } catch (error) {
    next(error);
  }
};

