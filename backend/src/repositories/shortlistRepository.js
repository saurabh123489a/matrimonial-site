import Shortlist from '../models/Shortlist.js';

export const shortlistRepository = {
  create: async (data) => {
    return await Shortlist.create(data);
  },

  findByPair: async (userId, shortlistedUserId) => {
    return await Shortlist.findOne({ userId, shortlistedUserId });
  },

  remove: async (userId, shortlistedUserId) => {
    return await Shortlist.findOneAndDelete({ userId, shortlistedUserId });
  },

  getUserShortlist: async (userId) => {
    return await Shortlist.find({ userId })
      .populate('shortlistedUserId', 'name email age city state religion photos')
      .sort({ createdAt: -1 });
  },

  checkIfShortlisted: async (userId, shortlistedUserId) => {
    return await Shortlist.exists({ userId, shortlistedUserId });
  },
};

