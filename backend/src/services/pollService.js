import { pollRepository } from '../repositories/pollRepository.js';
import { pollVoteRepository } from '../repositories/pollVoteRepository.js';
import { userRepository } from '../repositories/userRepository.js';

export const pollService = {
  async createPoll(data, createdById) {
    const creator = await userRepository.findById(createdById);
    if (!creator) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    // Only admins can create polls
    if (!creator.isAdmin) {
      const error = new Error('Unauthorized: Only admins can create polls');
      error.status = 403;
      throw error;
    }

    const pollData = {
      ...data,
      createdBy: createdById,
    };

    return await pollRepository.create(pollData);
  },

  async getPollById(pollId, userId = null) {
    const poll = await pollRepository.findById(pollId);
    if (!poll) {
      const error = new Error('Poll not found');
      error.status = 404;
      throw error;
    }

    // Check if user has voted
    let hasVoted = false;
    let userVotes = [];
    if (userId) {
      hasVoted = await pollVoteRepository.hasVoted(pollId, userId);
      if (hasVoted) {
        userVotes = await pollVoteRepository.findByPollAndUser(pollId, userId);
      }
    }

    return {
      ...poll.toObject(),
      hasVoted,
      userVotes: userVotes.map(v => v.optionId.toString()),
    };
  },

  async getPolls(filters = {}, options = {}) {
    return await pollRepository.findAll(filters, options);
  },

  async getActivePolls() {
    return await pollRepository.findActive();
  },

  async voteOnPoll(pollId, userId, optionId) {
    const poll = await pollRepository.findById(pollId);
    if (!poll) {
      const error = new Error('Poll not found');
      error.status = 404;
      throw error;
    }

    if (!poll.isActive) {
      const error = new Error('Poll is not active');
      error.status = 400;
      throw error;
    }

    // Check if poll has expired
    if (poll.expiresAt && new Date() > poll.expiresAt) {
      const error = new Error('Poll has expired');
      error.status = 400;
      throw error;
    }

    // Check if option exists
    const option = poll.options.id(optionId);
    if (!option) {
      const error = new Error('Invalid poll option');
      error.status = 400;
      throw error;
    }

    // Check if user has already voted (unless multiple votes allowed)
    if (!poll.allowMultipleVotes) {
      const hasVoted = await pollVoteRepository.hasVoted(pollId, userId);
      if (hasVoted) {
        const error = new Error('You have already voted on this poll');
        error.status = 400;
        throw error;
      }
    }

    // Create vote
    await pollVoteRepository.create({
      pollId,
      userId,
      optionId,
    });

    // Increment vote count
    await pollRepository.incrementVote(pollId, optionId);

    // Return updated poll
    return await pollRepository.findById(pollId);
  },

  async updatePoll(pollId, data, userId) {
    const poll = await pollRepository.findById(pollId);
    if (!poll) {
      const error = new Error('Poll not found');
      error.status = 404;
      throw error;
    }

    // Check if user is creator or admin
    if (poll.createdBy._id.toString() !== userId.toString()) {
      const user = await userRepository.findById(userId);
      if (!user || !user.isAdmin) {
        const error = new Error('Unauthorized: Only creator or admin can update poll');
        error.status = 403;
        throw error;
      }
    }

    return await pollRepository.updateById(pollId, data);
  },

  async deletePoll(pollId, userId) {
    const poll = await pollRepository.findById(pollId);
    if (!poll) {
      const error = new Error('Poll not found');
      error.status = 404;
      throw error;
    }

    // Check if user is creator or admin
    if (poll.createdBy._id.toString() !== userId.toString()) {
      const user = await userRepository.findById(userId);
      if (!user || !user.isAdmin) {
        const error = new Error('Unauthorized: Only creator or admin can delete poll');
        error.status = 403;
        throw error;
      }
    }

    return await pollRepository.deleteById(pollId);
  },
};

