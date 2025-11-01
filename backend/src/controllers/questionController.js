import { questionService } from '../services/questionService.js';

export const createQuestion = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, content, category, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        status: false,
        message: 'Title and content are required'
      });
    }

    const question = await questionService.createQuestion(userId, {
      title,
      content,
      category: category || 'general',
      tags: tags || []
    });

    res.status(201).json({
      status: true,
      message: 'Question created successfully',
      data: question
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Get userId if authenticated, otherwise null
    const userId = req.user ? req.user.id : null;
    
    const result = await questionService.getQuestionById(id, userId);
    
    res.json({
      status: true,
      message: 'Question retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getAllQuestions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, search, sortBy = 'createdAt' } = req.query;

    const result = await questionService.getAllQuestions(
      {},
      {
        page: parseInt(page),
        limit: parseInt(limit),
        category,
        search,
        sortBy
      }
    );

    res.json({
      status: true,
      message: 'Questions retrieved successfully',
      data: result.questions,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const question = await questionService.updateQuestion(id, userId, updateData);

    res.json({
      status: true,
      message: 'Question updated successfully',
      data: question
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await questionService.deleteQuestion(id, userId);

    res.json({
      status: true,
      message: 'Question deleted successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

export const voteQuestion = async (req, res, next) => {
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

    const question = await questionService.voteQuestion(id, userId, voteType);

    res.json({
      status: true,
      message: 'Vote updated successfully',
      data: question
    });
  } catch (error) {
    next(error);
  }
};

