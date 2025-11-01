import Answer from '../models/Answer.js';

export const answerRepository = {
  create: async (data) => {
    return await Answer.create(data);
  },

  findById: async (id) => {
    return await Answer.findById(id)
      .populate('author', 'name email photos')
      .populate('question');
  },

  findByQuestion: async (questionId, options = {}) => {
    const {
      skip = 0,
      limit = 50,
      sortBy = 'upvotes',
      sortOrder = -1
    } = options;

    return await Answer.find({ question: questionId, isActive: true })
      .populate('author', 'name email photos')
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder });
  },

  count: async (filters) => {
    return await Answer.countDocuments(filters);
  },

  updateById: async (id, update) => {
    return await Answer.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    ).populate('author', 'name email photos');
  },

  deleteById: async (id) => {
    return await Answer.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    );
  },

  unacceptAllForQuestion: async (questionId) => {
    return await Answer.updateMany(
      { question: questionId },
      { $set: { isAccepted: false } }
    );
  },
};

