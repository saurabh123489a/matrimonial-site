import Vote from '../models/Vote.js';

export const voteRepository = {
  create: async (data) => {
    return await Vote.create(data);
  },

  findByUserAndTarget: async (userId, targetType, targetId) => {
    return await Vote.findOne({
      user: userId,
      targetType,
      targetId
    });
  },

  updateById: async (id, update) => {
    return await Vote.findByIdAndUpdate(id, { $set: update }, { new: true });
  },

  delete: async (userId, targetType, targetId) => {
    return await Vote.findOneAndDelete({
      user: userId,
      targetType,
      targetId
    });
  },

  countVotes: async (targetType, targetId, voteType) => {
    return await Vote.countDocuments({
      targetType,
      targetId,
      voteType
    });
  },
};

