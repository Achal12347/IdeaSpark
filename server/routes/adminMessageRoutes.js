const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");
const adminMessageController = require("../controllers/adminMessageController");

const router = express.Router();

// Admin send + inbox
router.get("/admin", authMiddleware, requireAdmin, adminMessageController.getAdminInbox);
router.post("/", authMiddleware, requireAdmin, adminMessageController.sendMessage);

// User inbox (public + direct)
router.get("/inbox", authMiddleware, adminMessageController.getUserInbox);

// Hackathon inbox (public + team)
router.get(
  "/hackathon/:id/inbox",
  authMiddleware,
  adminMessageController.getHackathonInbox
);

// Admin-only hackathon chat
router.get(
  "/hackathon/:id/admin-chat",
  authMiddleware,
  requireAdmin,
  adminMessageController.getAdminHackathonChat
);

module.exports = router;
