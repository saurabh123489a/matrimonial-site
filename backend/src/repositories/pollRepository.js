import Poll from '../models/Poll.js';

export const pollRepository = {
  async create(data) {
    return await Poll.create(data);
  },

  async findById(id) {
    return await Poll.findById(id).populate('createdBy', 'name email');
  },

  async findAll(filters = {}, options = {}) {
    const { skip = 0, limit = 50, sortBy = 'createdAt', sortOrder = -1 } = options;
    return await Poll.find(filters)
      .populate('createdBy', 'name email')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);
  },

  async findActive(filters = {}) {
    return await Poll.find({ isActive: true, ...filters })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
  },

  async updateById(id, data) {
    return await Poll.findByIdAndUpdate(id, { $set: data }, { new: true })
      .populate('createdBy', 'name email');
  },

  async deleteById(id) {
    return await Poll.findByIdAndDelete(id);
  },

  async incrementVote(pollId, optionId) {
    return await Poll.findByIdAndUpdate(
      pollId,
      {
        $inc: { 'options.$[option].votes': 1, totalVotes: 1 },
      },
      {
        arrayFilters: [{ 'option._id': optionId }],
        new: true,
      }
    );
  },

  async count(filters = {}) {
    return await Poll.countDocuments(filters);
  },
};

