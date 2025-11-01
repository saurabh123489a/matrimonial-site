import { reportRepository } from '../repositories/reportRepository.js';
import { userRepository } from '../repositories/userRepository.js';

/**
 * Report Service - Business logic for profile reporting
 */
export const reportService = {
  /**
   * Create a new report
   */
  async createReport(reportData) {
    const { reportedUserId, reportedBy, reason, description } = reportData;

    // Check if reporter has community position
    const reporter = await userRepository.findById(reportedBy);
    if (!reporter) {
      const error = new Error('Reporter not found');
      error.status = 404;
      throw error;
    }

    if (!reporter.communityPosition) {
      const error = new Error('You must have a community position to report profiles');
      error.status = 403;
      throw error;
    }

    // Check if reported user exists
    const reportedUser = await userRepository.findById(reportedUserId);
    if (!reportedUser) {
      const error = new Error('Reported user not found');
      error.status = 404;
      throw error;
    }

    // Prevent self-reporting
    if (String(reportedBy) === String(reportedUserId)) {
      const error = new Error('Cannot report your own profile');
      error.status = 400;
      throw error;
    }

    // Check if user already reported this profile
    const existingReport = await reportRepository.findByReporterAndReported(
      reportedBy,
      reportedUserId
    );

    if (existingReport) {
      const error = new Error('You have already reported this profile');
      error.status = 409;
      throw error;
    }

    const report = await reportRepository.create({
      reportedUserId,
      reportedBy,
      reason,
      description,
      status: 'pending',
    });

    return await reportRepository.findById(report._id);
  },

  /**
   * Get all reports with pagination
   */
  async getAllReports(filters = {}, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const reports = await reportRepository.findMany(filters, {
      skip,
      limit: parseInt(limit),
      sortBy: 'createdAt',
      sortOrder: -1,
    });

    const total = await reportRepository.count(filters);

    return {
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get report by ID
   */
  async getReportById(reportId) {
    return await reportRepository.findById(reportId);
  },

  /**
   * Update report status
   */
  async updateReportStatus(reportId, updateData) {
    const report = await reportRepository.findById(reportId);
    if (!report) {
      const error = new Error('Report not found');
      error.status = 404;
      throw error;
    }

    const updateFields = {
      status: updateData.status,
      reviewedAt: new Date(),
      reviewedBy: updateData.reviewedBy,
    };

    if (updateData.adminNotes) {
      updateFields.adminNotes = updateData.adminNotes;
    }

    return await reportRepository.updateById(reportId, updateFields);
  },

  /**
   * Get reports for a specific user
   */
  async getReportsByUserId(userId) {
    return await reportRepository.findMany({ reportedUserId: userId });
  },
};

