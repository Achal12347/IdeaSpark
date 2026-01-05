const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { verifyFirebaseToken } = require("../middleware/authMiddleware");

// Check if profile exists
router.get("/:uid/exists", verifyFirebaseToken, async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ firebaseUID: uid });
    res.json({ exists: !!user?.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Save profile
router.post("/:uid", verifyFirebaseToken, async (req, res) => {
  try {
    const { uid } = req.params;
    const { name, expertise, workplace, bio } = req.body;

    let user = await User.findOne({ firebaseUID: uid });
    if (!user) {
      user = new User({ firebaseUID: uid, name, expertise, workplace, bio });
    } else {
      user.name = name;
      user.expertise = expertise;
      user.workplace = workplace;
      user.bio = bio;
    }
    await user.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
