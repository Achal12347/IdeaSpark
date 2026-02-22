const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.get("/users", async (req, res) => {
  try {
    const users = await User.find({ isDeleted: { $ne: true } })
      .select("name username roles profilePhoto bio expertise workplace createdAt")
      .sort({ createdAt: -1 })
      .limit(24);

    res.json(users);
  } catch (error) {
    console.error("Public users error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
