const DirectMessage = require("../models/DirectMessage");
const User = require("../models/User");
const logActivity = require("../utils/logActivity");

const getUserByFirebaseUid = (uid) => User.findOne({ firebaseUID: uid });

exports.getConversations = async (req, res) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const messages = await DirectMessage.find({
      $or: [{ sender: user._id }, { recipient: user._id }],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name email")
      .populate("recipient", "name email");

    const conversations = new Map();
    messages.forEach((message) => {
      const other =
        message.sender._id.toString() === user._id.toString()
          ? message.recipient
          : message.sender;
      const key = other._id.toString();
      if (!conversations.has(key)) {
        conversations.set(key, {
          user: other,
          lastMessage: message,
        });
      }
    });

    res.json(Array.from(conversations.values()));
  } catch (error) {
    res.status(500).json({ message: "Error fetching conversations", error });
  }
};

exports.getThread = async (req, res) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otherUser = await User.findById(req.params.userId);
    if (!otherUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const messages = await DirectMessage.find({
      $or: [
        { sender: user._id, recipient: otherUser._id },
        { sender: otherUser._id, recipient: user._id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name email")
      .populate("recipient", "name email");

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching thread", error });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { recipientId, content } = req.body;
    if (!recipientId || !content || !content.trim()) {
      return res.status(400).json({ message: "Recipient and content required." });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    const message = await DirectMessage.create({
      sender: user._id,
      recipient: recipient._id,
      content: content.trim(),
    });

    await message.populate("sender", "name email");
    await message.populate("recipient", "name email");
    const io = req.app?.get("io");
    await logActivity({
      userId: recipient._id,
      type: "direct_message_received",
      title: "New private message",
      message: user.name
        ? `Message from ${user.name}.`
        : `Message from ${user.email || "a user"}.`,
      link: "/messages",
      metadata: { senderId: user._id, messageId: message._id },
      io,
    });
    if (io) {
      io.emit("directMessage", message);
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error });
  }
};
