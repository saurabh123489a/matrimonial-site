import { answerRepository } from '../repositories/answerRepository.js';
import { questionRepository } from '../repositories/questionRepository.js';
import { voteRepository } from '../repositories/voteRepository.js';

export const answerService = {
  async createAnswer(questionId, authorId, content) {
    const question = await questionRepository.findById(questionId);
    if (!question) {
      const error = new Error('Question not found');
      error.status = 404;
      throw error;
    }

    const answer = await answerRepository.create({
      question: questionId,
      author: authorId,
      content
    });

    // Increment answer count on question
    await questionRepository.incrementAnswersCount(questionId);

    return await answerRepository.findById(answer._id);
  },

  async getAnswersByQuestion(questionId, options = {}) {
    const { page = 1, limit = 50, sortBy = 'upvotes' } = options;
    const skip = (page - 1) * limit;

    const [answers, total] = await Promise.all([
      answerRepository.findByQuestion(questionId, { skip, limit, sortBy, sortOrder: -1 }),
      answerRepository.count({ question: questionId, isActive: true })
    ]);

    return {
      answers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  async updateAnswer(answerId, userId, content) {
    const answer = await answerRepository.findById(answerId);
    
    if (!answer) {
      const error = new Error('Answer not found');
      error.status = 404;
      throw error;
    }

    if (answer.author._id.toString() !== userId.toString()) {
      const error = new Error('Not authorized to update this answer');
      error.status = 403;
      throw error;
    }

    return await answerRepository.updateById(answerId, { content });
  },

  async deleteAnswer(answerId, userId) {
    const answer = await answerRepository.findById(answerId);
    
    if (!answer) {
      const error = new Error('Answer not found');
      error.status = 404;
      throw error;
    }

    if (answer.author._id.toString() !== userId.toString()) {
      const error = new Error('Not authorized to delete this answer');
      error.status = 403;
      throw error;
    }

    return await answerRepository.deleteById(answerId);
  },

  async acceptAnswer(answerId, questionId, userId) {
    const question = await questionRepository.findById(questionId);
    if (!question) {
      const error = new Error('Question not found');
      error.status = 404;
      throw error;
    }

    if (question.author._id.toString() !== userId.toString()) {
      const error = new Error('Only question author can accept answers');
      error.status = 403;
      throw error;
    }

    const answer = await answerRepository.findById(answerId);
    if (!answer) {
      const error = new Error('Answer not found');
      error.status = 404;
      throw error;
    }

    // Unaccept all other answers
    await answerRepository.unacceptAllForQuestion(questionId);

    // Accept this answer
    await answerRepository.updateById(answerId, { isAccepted: true });
    await questionRepository.updateById(questionId, {
      isSolved: true,
      solvedAnswer: answerId
    });

    return await answerRepository.findById(answerId);
  },

  async voteAnswer(answerId, userId, voteType) {
    const answer = await answerRepository.findById(answerId);
    if (!answer) {
      const error = new Error('Answer not found');
      error.status = 404;
      throw error;
    }

    const existingVote = await voteRepository.findByUserAndTarget(userId, 'answer', answerId);
    
    if (existingVote) {
      if (existingVote.voteType === voteType) {
        await voteRepository.delete(userId, 'answer', answerId);
        const increment = voteType === 'upvote' ? -1 : -1;
        await answerRepository.updateById(answerId, {
          [voteType === 'upvote' ? 'upvotes' : 'downvotes']: answer[voteType === 'upvote' ? 'upvotes' : 'downvotes'] + increment
        });
      } else {
        await voteRepository.updateById(existingVote._id, { voteType });
        await answerRepository.updateById(answerId, {
          upvotes: answer.upvotes + (voteType === 'upvote' ? 1 : -1),
          downvotes: answer.downvotes + (voteType === 'downvote' ? 1 : -1)
        });
      }
    } else {
      await voteRepository.create({
        user: userId,
        targetType: 'answer',
        targetId: answerId,
        voteType
      });
      await answerRepository.updateById(answerId, {
        [voteType === 'upvote' ? 'upvotes' : 'downvotes']: answer[voteType === 'upvote' ? 'upvotes' : 'downvotes'] + 1
      });
    }

    return await answerRepository.findById(answerId);
  },
};

