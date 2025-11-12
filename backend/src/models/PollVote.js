import mongoose from 'mongoose';

const pollVoteSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Poll',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    optionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique constraint: one vote per user per poll (unless allowMultipleVotes is true)
pollVoteSchema.index({ pollId: 1, userId: 1, optionId: 1 }, { unique: true });
pollVoteSchema.index({ pollId: 1, userId: 1 });

export default mongoose.model('PollVote', pollVoteSchema);

