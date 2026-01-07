const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firebaseUID: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
    },

    expertise: {
      type: String,
    },

    workplace: {
      type: String,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user", // 👈 IMPORTANT
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
