import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    eventDate: {
      type: Date,
      required: true,
      index: true,
    },
    eventTime: {
      type: String, // HH:MM format
      required: true,
    },
    endDate: {
      type: Date,
    },
    location: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    organizerName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['gathering', 'meeting', 'celebration', 'workshop', 'seminar', 'other'],
      default: 'gathering',
    },
    maxAttendees: {
      type: Number,
      default: null, // null means unlimited
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    imageUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
      index: true,
    },
    tags: [{
      type: String,
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes
eventSchema.index({ eventDate: 1, status: 1 });
eventSchema.index({ organizer: 1, eventDate: -1 });
eventSchema.index({ city: 1, state: 1, eventDate: 1 });

export default mongoose.model('Event', eventSchema);

