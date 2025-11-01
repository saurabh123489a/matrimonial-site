import Family from '../models/Family.js';

export const familyRepository = {
  create: async (familyData) => {
    return await Family.create(familyData);
  },

  findById: async (familyId) => {
    return await Family.findById(familyId);
  },

  findByDistrict: async (district, state, options = {}) => {
    const { skip = 0, limit = 20, sortBy = 'createdAt', sortOrder = -1 } = options;
    const query = { district, state, isActive: true };

    return await Family.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);
  },

  findByState: async (state, options = {}) => {
    const { skip = 0, limit = 20, sortBy = 'createdAt', sortOrder = -1 } = options;
    const query = { state, isActive: true };

    return await Family.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);
  },

  search: async (filters, options = {}) => {
    const { skip = 0, limit = 20, sortBy = 'createdAt', sortOrder = -1 } = options;

    return await Family.find(filters)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);
  },

  count: async (filters) => {
    return await Family.countDocuments(filters);
  },

  updateById: async (familyId, updateData) => {
    return await Family.findByIdAndUpdate(
      familyId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  },

  deleteById: async (familyId) => {
    return await Family.findByIdAndUpdate(
      familyId,
      { $set: { isActive: false } },
      { new: true }
    );
  },
};

