import Question from '../models/Question.js';

export const questionRepository = {
  create: async (data) => {
    return await Question.create(data);
  },

  findById: async (id) => {
    return await Question.findById(id)
      .populate('author', 'name email photos')
      .populate('solvedAnswer');
  },

  findAll: async (filters = {}, options = {}) => {
    const {
      skip = 0,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = -1
    } = options;

    const query = Question.find(filters)
      .populate('author', 'name email photos')
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder });

    return await query.exec();
  },

  count: async (filters) => {
    return await Question.countDocuments(filters);
  },

  updateById: async (id, update) => {
    return await Question.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    ).populate('author', 'name email photos');
  },

  deleteById: async (id) => {
    return await Question.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    );
  },

  incrementAnswersCount: async (id) => {
    return await Question.findByIdAndUpdate(
      id,
      { $inc: { answersCount: 1 } },
      { new: true }
    );
  },

  incrementViews: async (id) => {
    return await Question.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );
  },
};

