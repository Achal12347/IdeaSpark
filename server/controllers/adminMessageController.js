const AdminMessage = require("../models/AdminMessage");
const HackathonTeam = require("../models/HackathonTeam");
const User = require("../models/User");

const getUserByFirebaseUid = (uid) => User.findOne({ firebaseUID: uid });

exports.sendMessage = async (req, res) => {
  try {
    const sender = await getUserByFirebaseUid(req.user.uid);
    if (!sender) {
      return res.status(404).json({ message: "User not found" });
    }
    if (sender.role !== "admin") {
      return res.status(403).json({ message: "Admin access required." });
    }

    const {
      recipientType,
      recipientId,
      content,
      visibility,
      hackathonId,
    } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content required." });
    }

    const message = await AdminMessage.create({
      sender: sender._id,
      recipientType: recipientType || "public",
      recipientId: recipientId || undefined,
      recipientModel:
        recipientType === "hackathon_team" ? "HackathonTeam" : "User",
      content: content.trim(),
      visibility: visibility || "public",
      hackathon: hackathonId || undefined,
    });
    await message.populate("sender", "name email");
    const io = req.app?.get("io");
    if (io) {
      io.emit("adminMessage", message);
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Error sending admin message", error });
  }
};

exports.getAdminInbox = async (req, res) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required." });
    }

    const messages = await AdminMessage.find({
      $or: [
        { recipientType: "public" },
        { recipientType: "admin", recipientId: user._id },
      ],
    })
      .populate("sender", "name email")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin inbox", error });
  }
};

exports.getUserInbox = async (req, res) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const messages = await AdminMessage.find({
      $or: [
        { recipientType: "public" },
        { recipientType: "user", recipientId: user._id },
      ],
    })
      .populate("sender", "name email")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching inbox", error });
  }
};

exports.getHackathonInbox = async (req, res) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const team = await HackathonTeam.findOne({
      hackathon: req.params.id,
      members: user._id,
    });

    const filters = [
      { hackathon: req.params.id, recipientType: "public" },
    ];
    if (team) {
      filters.push({
        hackathon: req.params.id,
        recipientType: "hackathon_team",
        recipientId: team._id,
      });
    }

    const messages = await AdminMessage.find({ $or: filters })
      .populate("sender", "name email")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching hackathon inbox", error });
  }
};

exports.getAdminHackathonChat = async (req, res) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required." });
    }

    const messages = await AdminMessage.find({
      hackathon: req.params.id,
      recipientType: "hackathon_admin",
    })
      .populate("sender", "name email")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin hackathon chat", error });
  }
};
