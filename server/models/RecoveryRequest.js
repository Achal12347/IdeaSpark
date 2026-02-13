const mongoose = require("mongoose");

const recoveryRequestSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["account", "idea"],
      required: true,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    idea: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Idea",
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNote: {
      type: String,
      trim: true,
    },
    decidedAt: {
      type: Date,
    },
    decidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RecoveryRequest", recoveryRequestSchema);
