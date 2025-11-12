import PollVote from '../models/PollVote.js';

export const pollVoteRepository = {
  async create(data) {
    return await PollVote.create(data);
  },

  async findByPollId(pollId) {
    return await PollVote.find({ pollId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
  },

  async findByUserId(userId) {
    return await PollVote.find({ userId })
      .populate('pollId')
      .sort({ createdAt: -1 });
  },

  async findByPollAndUser(pollId, userId) {
    return await PollVote.find({ pollId, userId });
  },

  async hasVoted(pollId, userId) {
    const count = await PollVote.countDocuments({ pollId, userId });
    return count > 0;
  },

  async deleteByPollAndUser(pollId, userId) {
    return await PollVote.deleteMany({ pollId, userId });
  },

  async countByPoll(pollId) {
    return await PollVote.countDocuments({ pollId });
  },
};

