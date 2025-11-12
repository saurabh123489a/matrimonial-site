import { pollService } from '../services/pollService.js';

/**
 * Create a new poll (Admin only)
 * POST /api/polls
 */
export const createPoll = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const poll = await pollService.createPoll(req.body, userId);
    res.status(201).json({
      status: true,
      message: 'Poll created successfully',
      data: poll,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all polls
 * GET /api/polls
 */
export const getPolls = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, isActive } = req.query;
    const filters = {};
    if (category) filters.category = category;
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const options = {
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit),
    };

    const polls = await pollService.getPolls(filters, options);
    res.json({
      status: true,
      message: 'Polls retrieved successfully',
      data: polls,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active polls
 * GET /api/polls/active
 */
export const getActivePolls = async (req, res, next) => {
  try {
    const polls = await pollService.getActivePolls();
    res.json({
      status: true,
      message: 'Active polls retrieved successfully',
      data: polls,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get poll by ID
 * GET /api/polls/:id
 */
export const getPollById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    const poll = await pollService.getPollById(id, userId);
    res.json({
      status: true,
      message: 'Poll retrieved successfully',
      data: poll,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Vote on poll
 * POST /api/polls/:id/vote
 */
export const voteOnPoll = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { optionId } = req.body;
    const poll = await pollService.voteOnPoll(id, userId, optionId);
    res.json({
      status: true,
      message: 'Vote submitted successfully',
      data: poll,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update poll (Admin/Creator only)
 * PATCH /api/polls/:id
 */
export const updatePoll = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const poll = await pollService.updatePoll(id, req.body, userId);
    res.json({
      status: true,
      message: 'Poll updated successfully',
      data: poll,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete poll (Admin/Creator only)
 * DELETE /api/polls/:id
 */
export const deletePoll = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    await pollService.deletePoll(id, userId);
    res.json({
      status: true,
      message: 'Poll deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

