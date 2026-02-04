const mongoose = require("mongoose");

const hackathonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    theme: { type: String, trim: true },
    banner: { type: String, trim: true },
    registrationStart: { type: Date, required: true },
    registrationEnd: { type: Date, required: true },
    submissionDeadline: { type: Date, required: true },
    resultAnnouncement: { type: Date, required: true },
    teamLimit: { type: Number, default: 5 },
    rules: [{ type: String, trim: true }],
    allowedTechnologies: [{ type: String, trim: true }],
    submissionFormat: [{ type: String, trim: true }],
    judgingCriteria: [{ type: String, trim: true }],
    prizes: [{ type: String, trim: true }],
    certificates: { type: String, trim: true },
    status: {
      type: String,
      enum: ["upcoming", "active", "completed"],
      default: "upcoming",
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    winners: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HackathonSubmission",
      },
    ],
    councilAdmins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    hostAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    launchConfirmations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    winnerConfirmations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hackathon", hackathonSchema);
