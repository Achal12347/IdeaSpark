const mongoose = require("mongoose");

const ideaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    problemStatement: {
      type: String,
      required: true,
    },
    solutionDescription: {
      type: String,
      required: true,
    },
    targetAudience: {
      type: String,
      required: true,
    },
    marketCategory: {
      type: String,
      required: true,
    },
    monetizationModel: {
      type: String,
      required: true,
    },
    stageOfIdea: {
      type: String,
      required: true,
    },
    lookingFor: [{
      type: String,
    }],
    estimatedBudget: {
      type: Number,
    },
    equityShare: {
      type: Number,
    },
    tags: [{
      type: String,
    }],
    ratings: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
    }],
    averageRating: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    pitches: [{
      investor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      pitchContent: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
      },
      equity: {
        type: Number,
      },
      status: {
        type: String,
        enum: ['pending', 'owner_accepted', 'countered', 'rejected', 'funded'],
        default: 'pending',
      },
      counterOffer: {
        amount: Number,
        equity: Number,
        message: String,
        createdAt: Date,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
      },
    }],
    fundingStatus: {
      type: String,
      enum: ['seeking', 'funded'],
      default: 'seeking',
    },
    interestedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    collaborators: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    views: {
      type: Number,
      default: 0,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Idea", ideaSchema);
