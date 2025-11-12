import mongoose from 'mongoose';

const rsvpSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['going', 'maybe', 'not-going'],
      required: true,
      default: 'going',
    },
    guests: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Unique constraint: one RSVP per user per event
rsvpSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export default mongoose.model('RSVP', rsvpSchema);

