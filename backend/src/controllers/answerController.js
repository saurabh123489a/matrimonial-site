import { answerService } from '../services/answerService.js';

export const createAnswer = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { questionId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        status: false,
        message: 'Content is required'
      });
    }

    const answer = await answerService.createAnswer(questionId, userId, content);

    res.status(201).json({
      status: true,
      message: 'Answer created successfully',
      data: answer
    });
  } catch (error) {
    next(error);
  }
};

export const getAnswers = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const { page = 1, limit = 50, sortBy = 'upvotes' } = req.query;

    const result = await answerService.getAnswersByQuestion(questionId, {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy
    });

    res.json({
      status: true,
      message: 'Answers retrieved successfully',
      data: result.answers,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

export const updateAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    const answer = await answerService.updateAnswer(id, userId, content);

    res.json({
      status: true,
      message: 'Answer updated successfully',
      data: answer
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await answerService.deleteAnswer(id, userId);

    res.json({
      status: true,
      message: 'Answer deleted successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

export const acceptAnswer = async (req, res, next) => {
  try {
    const { id, questionId } = req.params;
    const userId = req.user.id;

    const answer = await answerService.acceptAnswer(id, questionId, userId);

    res.json({
      status: true,
      message: 'Answer accepted successfully',
      data: answer
    });
  } catch (error) {
    next(error);
  }
};

export const voteAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { voteType } = req.body;

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({
        status: false,
        message: 'voteType must be either "upvote" or "downvote"'
      });
    }

    const answer = await answerService.voteAnswer(id, userId, voteType);

    res.json({
      status: true,
      message: 'Vote updated successfully',
      data: answer
    });
  } catch (error) {
    next(error);
  }
};

