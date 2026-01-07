const express = require("express");
const verifyFirebaseToken = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

/**
 * @route   GET /api/auth/verify
 * @desc    Verify Firebase token (test route)
 * @access  Private
 */
router.get("/verify", verifyFirebaseToken, (req, res) => {
  res.json({
    success: true,
    uid: req.user.uid,
    message: "Token verified successfully",
  });
});

router.get("/me", verifyFirebaseToken, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUID: req.user.uid });

    // 🔥 DO NOT throw error if user missing
    if (!user) {
      return res.json({
        exists: false,
        role: "user",
      });
    }

    res.json({
      exists: true,
      role: user.role || "user",
    });
  } catch (err) {
    console.error("auth/me error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
