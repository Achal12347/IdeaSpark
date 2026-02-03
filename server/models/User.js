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
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    profilePhoto: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: 150,
    },
    roles: [
      {
        type: String,
      },
    ],
    skills: [
      {
        type: String,
      },
    ],
    interests: [
      {
        type: String,
      },
    ],
    experienceLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
    },
    collaborationPreferences: [
      {
        type: String,
      },
    ],
    availability: {
      type: String,
      enum: ["Part-time", "Full-time", "Weekends"],
    },
    links: {
      github: { type: String },
      portfolio: { type: String },
      linkedin: { type: String },
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
