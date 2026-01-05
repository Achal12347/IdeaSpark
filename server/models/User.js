const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firebaseUID: { type: String, required: true, unique: true },
  name: { type: String },
  expertise: { type: String },
  workplace: { type: String },
  bio: { type: String },
  role: { type: String, default: "innovator" },
});

module.exports = mongoose.model("User", userSchema);
