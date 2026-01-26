const express = require("express");
const User = require("../models/User");
const verifyFirebaseToken = require("../middleware/authMiddleware");

const router = express.Router();

/* Check profile exists */
router.get("/:uid/exists", verifyFirebaseToken, async (req, res) => {
  console.log("PROFILE CHECK HIT FOR UID:", req.params.uid);

  const user = await User.findOne({ firebaseUID: req.params.uid });
  res.json({ exists: !!user });
});

/* Get user data */
router.get("/:uid", verifyFirebaseToken, async (req, res) => {
  const user = await User.findOne({ firebaseUID: req.params.uid });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json(user);
});

/* Save profile */
router.post("/", verifyFirebaseToken, async (req, res) => {
  const { name, expertise, workplace } = req.body;

  const user = new User({
    firebaseUID: req.user.uid,
    name,
    expertise,
    workplace,
    role: "user",
  });

  await user.save();
  res.status(201).json({ success: true });
});

module.exports = router;
