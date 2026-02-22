const express = require("express");
const User = require("../models/User");
const Idea = require("../models/Idea");
const verifyFirebaseToken = require("../middleware/authMiddleware");
const logActivity = require("../utils/logActivity");

const router = express.Router();

/* ================================
   Admin: list all users
   GET /api/users
================================ */
router.get("/", verifyFirebaseToken, async (req, res) => {
  try {
    const requester = await User.findOne({ firebaseUID: req.user.uid });
    if (!requester || requester.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const users = await User.find({ isDeleted: { $ne: true } }).select("-firebaseUID");
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ================================
   Admin: list admin users
   GET /api/users/admins
================================ */
router.get("/admins", verifyFirebaseToken, async (req, res) => {
  try {
    const requester = await User.findOne({ firebaseUID: req.user.uid });
    if (!requester || requester.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const admins = await User.find({ role: "admin", isDeleted: { $ne: true } }).select(
      "name email roles"
    );
    res.json(admins);
  } catch (err) {
    console.error("Get admins error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ================================
   Admin: delete user (soft delete)
   DELETE /api/users/:id
================================ */
router.delete("/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const requester = await User.findOne({ firebaseUID: req.user.uid });
    if (!requester || requester.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const { reason } = req.body || {};
    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: "Deletion reason is required." });
    }

    if (requester._id.toString() === id) {
      return res.status(400).json({ error: "You cannot delete your own account." });
    }

    const user = await User.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletionReason: reason.trim(),
        deletedAt: new Date(),
        deletedBy: requester._id,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const io = req.app?.get("io");
    if (io) {
      io.emit("userUpdated", { userId: user._id.toString() });
      io.emit("membersUpdated");
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ================================
   Bookmarks
   GET /api/users/bookmarks
   POST /api/users/bookmarks
   DELETE /api/users/bookmarks/:ideaId
================================ */
router.get("/bookmarks", verifyFirebaseToken, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUID: req.user.uid }).populate("bookmarks");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user.bookmarks || []);
  } catch (err) {
    console.error("Get bookmarks error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/bookmarks", verifyFirebaseToken, async (req, res) => {
  try {
    const { ideaId } = req.body;
    if (!ideaId) {
      return res.status(400).json({ error: "Idea ID is required." });
    }

    const user = await User.findOne({ firebaseUID: req.user.uid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const exists = user.bookmarks?.some((id) => id.toString() === ideaId);
    if (!exists) {
      user.bookmarks = user.bookmarks || [];
      user.bookmarks.push(ideaId);
      await user.save();
    }
    const io = req.app?.get("io");
    if (io) {
      io.emit("bookmarksUpdated", { userId: user._id.toString() });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Add bookmark error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/bookmarks/:ideaId", verifyFirebaseToken, async (req, res) => {
  try {
    const { ideaId } = req.params;
    const user = await User.findOne({ firebaseUID: req.user.uid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.bookmarks = (user.bookmarks || []).filter(
      (bookmarkId) => bookmarkId.toString() !== ideaId
    );
    await user.save();
    const io = req.app?.get("io");
    if (io) {
      io.emit("bookmarksUpdated", { userId: user._id.toString() });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Remove bookmark error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ================================
   Member directory
   GET /api/users/members
================================ */
router.get("/members", verifyFirebaseToken, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUID: req.user.uid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const ideas = await Idea.find({
      $or: [{ author: user._id }, { collaborators: user._id }],
    }).select("author collaborators");

    const collaboratorIds = new Set();
    ideas.forEach((idea) => {
      if (idea.author) {
        collaboratorIds.add(idea.author.toString());
      }
      (idea.collaborators || []).forEach((collabId) => {
        collaboratorIds.add(collabId.toString());
      });
    });
    collaboratorIds.delete(user._id.toString());

    const members = await User.find({
      _id: { $ne: user._id },
      isDeleted: { $ne: true },
    }).select("-firebaseUID");

    const result = members.map((member) => ({
      ...member.toObject(),
      isCollaborator: collaboratorIds.has(member._id.toString()),
    }));

    res.json(result);
  } catch (err) {
    console.error("Get members error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

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
    res.json({
      exists: !!user,
      deleted: Boolean(user?.isDeleted),
      deletionReason: user?.deletionReason || "",
    });
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
      notificationSettings,
      appearanceSettings,
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
      notificationSettings,
      appearanceSettings,
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
    const io = req.app?.get("io");
    if (io) {
      io.emit("userUpdated", { userId: user._id.toString() });
      io.emit("membersUpdated");
    }
    await logActivity({
      userId: user._id,
      type: existingUser ? "profile_updated" : "profile_created",
      title: existingUser ? "Profile updated" : "Profile setup complete",
      message: existingUser
        ? "Your profile information was updated."
        : "Your profile is now live and ready.",
      link: "/profile",
      metadata: { userId: user._id, isNew: !existingUser },
      io,
    });

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
