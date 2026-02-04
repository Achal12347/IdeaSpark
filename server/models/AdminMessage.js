const mongoose = require("mongoose");

const adminMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientType: {
      type: String,
      enum: ["public", "admin", "user", "hackathon_team", "hackathon_admin"],
      default: "public",
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "recipientModel",
    },
    recipientModel: {
      type: String,
      enum: ["User", "HackathonTeam"],
    },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminMessage", adminMessageSchema);
