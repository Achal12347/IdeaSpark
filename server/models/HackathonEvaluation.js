const mongoose = require("mongoose");

const hackathonEvaluationSchema = new mongoose.Schema(
  {
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HackathonSubmission",
      required: true,
    },
    judge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    scores: {
      innovation: { type: Number, default: 0 },
      feasibility: { type: Number, default: 0 },
      design: { type: Number, default: 0 },
      technical: { type: Number, default: 0 },
      impact: { type: Number, default: 0 },
    },
    feedback: { type: String, trim: true },
    totalScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

hackathonEvaluationSchema.index({ submission: 1, judge: 1 }, { unique: true });

module.exports = mongoose.model("HackathonEvaluation", hackathonEvaluationSchema);
