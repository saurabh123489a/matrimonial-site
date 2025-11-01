import ProfileReport from '../models/ProfileReport.js';

export const reportRepository = {
  create: async (reportData) => {
    return await ProfileReport.create(reportData);
  },

  findById: async (reportId) => {
    return await ProfileReport.findById(reportId)
      .populate('reportedUserId', 'name email phone photos')
      .populate('reportedBy', 'name email phone communityPosition')
      .populate('reviewedBy', 'name email');
  },

  findMany: async (filters = {}, options = {}) => {
    const {
      skip = 0,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = -1,
    } = options;

    return await ProfileReport.find(filters)
      .populate('reportedUserId', 'name email phone photos')
      .populate('reportedBy', 'name email phone communityPosition')
      .populate('reviewedBy', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .exec();
  },

  count: async (filters = {}) => {
    return await ProfileReport.countDocuments(filters);
  },

  updateById: async (reportId, updateData) => {
    return await ProfileReport.findByIdAndUpdate(
      reportId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('reportedUserId', 'name email phone photos')
      .populate('reportedBy', 'name email phone communityPosition')
      .populate('reviewedBy', 'name email');
  },

  findByReporterAndReported: async (reporterId, reportedUserId) => {
    return await ProfileReport.findOne({
      reportedBy: reporterId,
      reportedUserId: reportedUserId,
    });
  },

  deleteById: async (reportId) => {
    return await ProfileReport.findByIdAndDelete(reportId);
  },
};

