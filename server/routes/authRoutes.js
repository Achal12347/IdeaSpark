const express = require("express");
const verifyFirebaseToken = require("../middleware/authMiddleware");

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

module.exports = router;
