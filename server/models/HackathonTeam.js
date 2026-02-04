const mongoose = require("mongoose");

const hackathonTeamSchema = new mongoose.Schema(
  {
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

hackathonTeamSchema.index({ hackathon: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("HackathonTeam", hackathonTeamSchema);
