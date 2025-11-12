import PushSubscription from '../models/PushSubscription.js';

export const pushSubscriptionRepository = {
  async create(data) {
    return await PushSubscription.create(data);
  },

  async findByUserId(userId) {
    return await PushSubscription.find({ userId, isActive: true });
  },

  async findByEndpoint(endpoint) {
    return await PushSubscription.findOne({ endpoint });
  },

  async updateByEndpoint(endpoint, data) {
    return await PushSubscription.findOneAndUpdate(
      { endpoint },
      { $set: data },
      { new: true, upsert: true }
    );
  },

  async deleteByEndpoint(endpoint) {
    return await PushSubscription.findOneAndDelete({ endpoint });
  },

  async deactivateByUserId(userId) {
    return await PushSubscription.updateMany(
      { userId },
      { $set: { isActive: false } }
    );
  },

  async getAllActive() {
    return await PushSubscription.find({ isActive: true }).populate('userId', 'name email');
  },
};

