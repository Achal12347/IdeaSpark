const express = require("express");
const User = require("../models/User");
const verifyFirebaseToken = require("../middleware/authMiddleware");

const router = express.Router();

/* ================================
   Check if profile exists
   GET /api/users/:uid/exists
================================ */
router.get("/:uid/exists", verifyFirebaseToken, async (req, res) => {
  try {
    // 🔒 Security: users can only check their own profile
    if (req.user.uid !== req.params.uid) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const user = await User.findOne({ firebaseUID: req.user.uid });
    res.json({ exists: !!user });
  } catch (err) {
    console.error("Profile exists error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ================================
   Get logged-in user data
   GET /api/users/me
================================ */
router.get("/me", verifyFirebaseToken, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUID: req.user.uid });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ================================
   Create / Update profile
   POST /api/users
================================ */
router.post("/", verifyFirebaseToken, async (req, res) => {
  try {
    const {
      name,
      username,
      profilePhoto,
      bio,
      roles,
      skills,
      interests,
      experienceLevel,
      collaborationPreferences,
      availability,
      links,
      expertise,
      workplace,
    } = req.body;

    const existingUser = await User.findOne({ firebaseUID: req.user.uid });

    if (!existingUser) {
      if (!name || !username || !Array.isArray(roles) || roles.length === 0) {
        return res.status(400).json({
          error: "Name, username, and at least one role are required.",
        });
      }
    }

    if (username) {
      const normalizedUsername = username.toLowerCase().trim();
      const usernameOwner = await User.findOne({ username: normalizedUsername });
      if (usernameOwner && usernameOwner.firebaseUID !== req.user.uid) {
        return res.status(400).json({ error: "Username already taken." });
      }
    }

    const update = {
      firebaseUID: req.user.uid,
      name,
      username: username ? username.toLowerCase().trim() : undefined,
      profilePhoto,
      bio,
      roles,
      skills,
      interests,
      experienceLevel,
      collaborationPreferences,
      availability,
      links,
      expertise,
      workplace,
      role: existingUser?.role || "user",
    };

    Object.keys(update).forEach((key) => {
      if (update[key] === undefined) {
        delete update[key];
      }
    });

    // ✅ UPSERT prevents duplicate users
    const user = await User.findOneAndUpdate(
      { firebaseUID: req.user.uid },
      update,
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("Save profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
