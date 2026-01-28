const mongoose = require('mongoose');

const hackathonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    registrationDeadline: {
      type: Date,
      required: true,
    },
    maxParticipants: {
      type: Number,
      default: 100,
    },
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    submissions: [{
      team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
      },
      idea: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Idea',
      },
      submittedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    judges: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    prizes: [{
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
      },
      value: {
        type: Number,
      },
    }],
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed'],
      default: 'upcoming',
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rules: {
      type: String,
    },
    themes: [{
      type: String,
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hackathon', hackathonSchema);
