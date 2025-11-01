import { questionRepository } from '../repositories/questionRepository.js';
import { answerRepository } from '../repositories/answerRepository.js';
import { voteRepository } from '../repositories/voteRepository.js';

export const questionService = {
  async createQuestion(authorId, data) {
    const question = await questionRepository.create({
      ...data,
      author: authorId
    });
    return await questionRepository.findById(question._id);
  },

  async getQuestionById(questionId, userId = null) {
    const question = await questionRepository.findById(questionId);
    
    if (!question) {
      const error = new Error('Question not found');
      error.status = 404;
      throw error;
    }

    // Increment views
    await questionRepository.incrementViews(questionId);

    // Get user's vote if authenticated
    let userVote = null;
    if (userId) {
      userVote = await voteRepository.findByUserAndTarget(userId, 'question', questionId);
    }

    return {
      question,
      userVote: userVote ? userVote.voteType : null
    };
  },

  async getAllQuestions(filters = {}, options = {}) {
    const { page = 1, limit = 20, category, search, sortBy = 'createdAt' } = options;
    const skip = (page - 1) * limit;

    const queryFilters = { isActive: true };
    
    if (category) {
      queryFilters.category = category;
    }

    if (search) {
      queryFilters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const [questions, total] = await Promise.all([
      questionRepository.findAll(queryFilters, { skip, limit, sortBy, sortOrder: -1 }),
      questionRepository.count(queryFilters)
    ]);

    return {
      questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  async updateQuestion(questionId, userId, updateData) {
    const question = await questionRepository.findById(questionId);
    
    if (!question) {
      const error = new Error('Question not found');
      error.status = 404;
      throw error;
    }

    const authorId = question.author?._id?.toString() || question.author?.toString() || String(question.author);
    if (authorId !== userId.toString()) {
      const error = new Error('Not authorized to update this question');
      error.status = 403;
      throw error;
    }

    return await questionRepository.updateById(questionId, updateData);
  },

  async deleteQuestion(questionId, userId) {
    const question = await questionRepository.findById(questionId);
    
    if (!question) {
      const error = new Error('Question not found');
      error.status = 404;
      throw error;
    }

    const authorId = question.author?._id?.toString() || question.author?.toString() || String(question.author);
    if (authorId !== userId.toString()) {
      const error = new Error('Not authorized to delete this question');
      error.status = 403;
      throw error;
    }

    return await questionRepository.deleteById(questionId);
  },

  async voteQuestion(questionId, userId, voteType) {
    const question = await questionRepository.findById(questionId);
    if (!question) {
      const error = new Error('Question not found');
      error.status = 404;
      throw error;
    }

    const existingVote = await voteRepository.findByUserAndTarget(userId, 'question', questionId);
    
    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote if clicking same vote type
        await voteRepository.delete(userId, 'question', questionId);
        const increment = voteType === 'upvote' ? -1 : -1;
        await questionRepository.updateById(questionId, {
          [voteType === 'upvote' ? 'upvotes' : 'downvotes']: question[voteType === 'upvote' ? 'upvotes' : 'downvotes'] + increment
        });
      } else {
        // Change vote type
        await voteRepository.updateById(existingVote._id, { voteType });
        await questionRepository.updateById(questionId, {
          upvotes: question.upvotes + (voteType === 'upvote' ? 1 : -1),
          downvotes: question.downvotes + (voteType === 'downvote' ? 1 : -1)
        });
      }
    } else {
      // New vote
      await voteRepository.create({
        user: userId,
        targetType: 'question',
        targetId: questionId,
        voteType
      });
      await questionRepository.updateById(questionId, {
        [voteType === 'upvote' ? 'upvotes' : 'downvotes']: question[voteType === 'upvote' ? 'upvotes' : 'downvotes'] + 1
      });
    }

    return await questionRepository.findById(questionId);
  },
};

