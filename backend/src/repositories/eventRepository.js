import Event from '../models/Event.js';

export const eventRepository = {
  async create(data) {
    return await Event.create(data);
  },

  async findById(id) {
    return await Event.findById(id).populate('organizer', 'name email phone');
  },

  async findAll(filters = {}, options = {}) {
    const { skip = 0, limit = 50, sortBy = 'eventDate', sortOrder = 1 } = options;
    return await Event.find(filters)
      .populate('organizer', 'name email phone')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);
  },

  async findByDateRange(startDate, endDate, filters = {}) {
    return await Event.find({
      eventDate: { $gte: startDate, $lte: endDate },
      ...filters,
    })
      .populate('organizer', 'name email phone')
      .sort({ eventDate: 1 });
  },

  async updateById(id, data) {
    return await Event.findByIdAndUpdate(id, { $set: data }, { new: true })
      .populate('organizer', 'name email phone');
  },

  async deleteById(id) {
    return await Event.findByIdAndDelete(id);
  },

  async count(filters = {}) {
    return await Event.countDocuments(filters);
  },
};

