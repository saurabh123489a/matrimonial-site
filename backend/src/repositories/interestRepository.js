import Interest from '../models/Interest.js';

export const interestRepository = {
  create: async (data) => {
    return await Interest.create(data);
  },

  findByPair: async (fromUser, toUser) => {
    return await Interest.findOne({ fromUser, toUser });
  },

  updateStatus: async (fromUser, toUser, status) => {
    return await Interest.findOneAndUpdate(
      { fromUser, toUser },
      { status },
      { new: true }
    );
  },

  getIncoming: async (userId) => {
    return await Interest.find({ toUser: userId, status: 'pending' })
      .populate('fromUser', 'name email age city state religion photos')
      .sort({ createdAt: -1 });
  },

  getOutgoing: async (userId) => {
    return await Interest.find({ fromUser: userId })
      .populate('toUser', 'name email age city state religion photos')
      .sort({ createdAt: -1 });
  },

  getAccepted: async (userId) => {
    return await Interest.find({
      $or: [
        { fromUser: userId, status: 'accepted' },
        { toUser: userId, status: 'accepted' }
      ]
    })
      .populate('fromUser', 'name email age city state religion photos')
      .populate('toUser', 'name email age city state religion photos')
      .sort({ createdAt: -1 });
  },
};

