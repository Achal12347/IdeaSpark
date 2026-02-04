const mongoose = require("mongoose");

const hackathonSubmissionSchema = new mongoose.Schema(
  {
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HackathonTeam",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    problemStatement: { type: String, trim: true },
    solutionExplanation: { type: String, trim: true },
    githubLink: { type: String, trim: true },
    demoLink: { type: String, trim: true },
    files: [{ type: String, trim: true }],
    submittedAt: { type: Date, default: Date.now },
    averageScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

hackathonSubmissionSchema.index({ hackathon: 1, team: 1 }, { unique: true });

module.exports = mongoose.model("HackathonSubmission", hackathonSubmissionSchema);
