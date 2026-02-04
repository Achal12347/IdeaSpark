const mongoose = require("mongoose");

const hackathonParticipantSchema = new mongoose.Schema(
  {
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

hackathonParticipantSchema.index({ hackathon: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("HackathonParticipant", hackathonParticipantSchema);
