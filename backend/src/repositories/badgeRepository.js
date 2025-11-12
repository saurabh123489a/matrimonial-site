import Badge from '../models/Badge.js';

export const badgeRepository = {
  async create(data) {
    return await Badge.create(data);
  },

  async findById(id) {
    return await Badge.findById(id);
  },

  async findByName(name) {
    return await Badge.findOne({ name });
  },

  async findAll(filters = {}) {
    return await Badge.find(filters).sort({ createdAt: -1 });
  },

  async findActive() {
    return await Badge.find({ isActive: true }).sort({ category: 1, name: 1 });
  },

  async updateById(id, data) {
    return await Badge.findByIdAndUpdate(id, { $set: data }, { new: true });
  },

  async deleteById(id) {
    return await Badge.findByIdAndDelete(id);
  },
};

