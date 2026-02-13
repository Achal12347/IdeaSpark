const express = require("express");
const verifyFirebaseToken = require("../middleware/authMiddleware");
const RecoveryRequest = require("../models/RecoveryRequest");
const User = require("../models/User");
const Idea = require("../models/Idea");

const router = express.Router();

const isAdmin = async (uid) => {
  const user = await User.findOne({ firebaseUID: uid });
  return user && user.role === "admin" ? user : null;
};

router.post("/", verifyFirebaseToken, async (req, res) => {
  try {
    const requester = await User.findOne({ firebaseUID: req.user.uid });
    if (!requester) {
      return res.status(404).json({ message: "User not found" });
    }

    const { type, reason, ideaId } = req.body || {};
    if (!type || !["account", "idea"].includes(type)) {
      return res.status(400).json({ message: "Invalid request type" });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: "Reason is required" });
    }

    if (type === "account") {
      if (!requester.isDeleted) {
        return res.status(400).json({ message: "Account is not deleted" });
      }
    }

    let idea = null;
    if (type === "idea") {
      if (!ideaId) {
        return res.status(400).json({ message: "Idea ID is required" });
      }
      idea = await Idea.findById(ideaId);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }
      if (!idea.isDeleted) {
        return res.status(400).json({ message: "Idea is not deleted" });
      }
      if (idea.author?.toString() !== requester._id.toString()) {
        return res.status(403).json({ message: "Only the idea owner can request recovery" });
      }
    }

    const existingQuery = {
      requester: requester._id,
      type,
      status: "pending",
    };
    if (idea) {
      existingQuery.idea = idea._id;
    }

    const existing = await RecoveryRequest.findOne(existingQuery);

    if (existing) {
      return res.status(200).json({ message: "Request already pending", request: existing });
    }

    const request = await RecoveryRequest.create({
      type,
      requester: requester._id,
      idea: idea ? idea._id : undefined,
      reason: reason.trim(),
      status: "pending",
    });

    const io = req.app?.get("io");
    if (io) {
      io.emit("recoveryRequestUpdated");
    }

    res.status(201).json({ message: "Recovery request submitted", request });
  } catch (error) {
    console.error("Recovery request error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", verifyFirebaseToken, async (req, res) => {
  try {
    const requester = await User.findOne({ firebaseUID: req.user.uid });
    if (!requester) {
      return res.status(404).json({ message: "User not found" });
    }

    const { type, ideaId } = req.query || {};
    const query = { requester: requester._id };
    if (type && ["account", "idea"].includes(type)) {
      query.type = type;
    }
    if (ideaId) {
      query.idea = ideaId;
    }

    const requests = await RecoveryRequest.find(query)
      .populate("idea", "title")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error("Recovery request fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", verifyFirebaseToken, async (req, res) => {
  try {
    const admin = await isAdmin(req.user.uid);
    if (!admin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const requests = await RecoveryRequest.find()
      .populate("requester", "name email")
      .populate("idea", "title")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error("Recovery request list error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/decide", verifyFirebaseToken, async (req, res) => {
  try {
    const admin = await isAdmin(req.user.uid);
    if (!admin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { action, adminNote } = req.body || {};
    if (!action || !["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const request = await RecoveryRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already decided" });
    }

    if (action === "approve") {
      if (request.type === "account") {
        await User.findByIdAndUpdate(request.requester, {
          isDeleted: false,
          deletionReason: "",
          deletedAt: null,
          deletedBy: null,
        });
      }

      if (request.type === "idea" && request.idea) {
        await Idea.findByIdAndUpdate(request.idea, {
          isDeleted: false,
          deletionReason: "",
          deletedAt: null,
          deletedBy: null,
        });
      }

      request.status = "approved";
    } else {
      request.status = "rejected";
    }

    request.adminNote = adminNote ? adminNote.trim() : "";
    request.decidedAt = new Date();
    request.decidedBy = admin._id;
    await request.save();

    const io = req.app?.get("io");
    if (io) {
      io.emit("recoveryRequestUpdated");
      io.emit("ideasUpdated");
      io.emit("userUpdated", { userId: request.requester.toString() });
      io.emit("membersUpdated");
    }

    res.json({ message: "Request updated", request });
  } catch (error) {
    console.error("Recovery request decide error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
