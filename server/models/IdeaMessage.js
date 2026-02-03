const mongoose = require("mongoose");

const ideaMessageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    idea: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Idea",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("IdeaMessage", ideaMessageSchema);
