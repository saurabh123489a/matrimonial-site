import Marriage from '../models/Marriage.js';

export const marriageRepository = {
  create: async (marriageData) => {
    return await Marriage.create(marriageData);
  },

  findById: async (marriageId) => {
    return await Marriage.findById(marriageId)
      .populate('groomUserId', 'name photos city state')
      .populate('brideUserId', 'name photos city state')
      .populate('registeredBy.userId', 'name');
  },

  getRecentMarriages: async (options = {}) => {
    const { skip = 0, limit = 20, verifiedOnly = true } = options;
    const query = { isActive: true };
    if (verifiedOnly) {
      query.isVerified = true;
    }

    return await Marriage.find(query)
      .populate('groomUserId', 'name photos city state district')
      .populate('brideUserId', 'name photos city state district')
      .sort({ marriageDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);
  },

  getByDistrict: async (district, options = {}) => {
    const { skip = 0, limit = 20 } = options;
    const query = {
      'marriageLocation.district': district,
      isActive: true,
      isVerified: true,
    };

    return await Marriage.find(query)
      .populate('groomUserId', 'name photos city state')
      .populate('brideUserId', 'name photos city state')
      .sort({ marriageDate: -1 })
      .skip(skip)
      .limit(limit);
  },

  getByDateRange: async (startDate, endDate, options = {}) => {
    const { skip = 0, limit = 20 } = options;
    const query = {
      marriageDate: { $gte: startDate, $lte: endDate },
      isActive: true,
      isVerified: true,
    };

    return await Marriage.find(query)
      .populate('groomUserId', 'name photos city state')
      .populate('brideUserId', 'name photos city state')
      .sort({ marriageDate: -1 })
      .skip(skip)
      .limit(limit);
  },

  count: async (filters = {}) => {
    return await Marriage.countDocuments({ ...filters, isActive: true, isVerified: true });
  },

  updateById: async (marriageId, updateData) => {
    return await Marriage.findByIdAndUpdate(
      marriageId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  },

  incrementViews: async (marriageId) => {
    return await Marriage.findByIdAndUpdate(
      marriageId,
      { $inc: { views: 1 } },
      { new: true }
    );
  },
};

