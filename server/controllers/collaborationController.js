const CollaborationRequest = require("../models/CollaborationRequest");
const Idea = require("../models/Idea");
const User = require("../models/User");
const logActivity = require("../utils/logActivity");

const getUserByFirebaseUid = (uid) => User.findOne({ firebaseUID: uid });

const canSendRequestForIdea = (idea, requesterId, recipientId) => {
  if (!idea) return true;
  const ownerId = idea.author?.toString();
  if (!ownerId) return false;
  const requester = requesterId?.toString();
  const recipient = recipientId?.toString();

  if (ownerId === requester) {
    return ownerId !== recipient;
  }
  return ownerId === recipient;
};

exports.createRequest = async (req, res) => {
  try {
    const { recipientId, ideaId, message } = req.body;
    const requester = await getUserByFirebaseUid(req.user.uid);

    if (!requester) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!recipientId) {
      return res.status(400).json({ message: "Recipient is required." });
    }

    if (requester._id.toString() === recipientId.toString()) {
      return res.status(400).json({ message: "You cannot request yourself." });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found." });
    }

    let idea = null;
    if (ideaId) {
      idea = await Idea.findById(ideaId);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found." });
      }
      if (!canSendRequestForIdea(idea, requester._id, recipient._id)) {
        return res.status(403).json({ message: "Not allowed to request for this idea." });
      }
    }

    const existingRequest = await CollaborationRequest.findOne({
      requester: requester._id,
      recipient: recipient._id,
      idea: idea ? idea._id : undefined,
      status: "pending",
    });

    if (existingRequest) {
      return res.json({ message: "Request already sent.", request: existingRequest });
    }

    const newRequest = await CollaborationRequest.create({
      requester: requester._id,
      recipient: recipient._id,
      idea: idea ? idea._id : undefined,
      message: message ? message.trim() : "",
    });
    const io = req.app?.get("io");
    await logActivity({
      userId: requester._id,
      type: "collaboration_request_sent",
      title: "Collaboration request sent",
      message: idea?.title
        ? `You requested to collaborate on "${idea.title}".`
        : `You sent a collaboration request to ${recipient.name || recipient.email}.`,
      link: "/activity",
      metadata: { requestId: newRequest._id, ideaId: idea?._id },
      io,
    });
    await logActivity({
      userId: recipient._id,
      type: "collaboration_request_received",
      title: "New collaboration request",
      message: idea?.title
        ? `${requester.name || requester.email} wants to collaborate on "${idea.title}".`
        : `${requester.name || requester.email} sent you a collaboration request.`,
      link: "/activity",
      metadata: { requestId: newRequest._id, ideaId: idea?._id },
      io,
    });
    if (io) {
      io.emit("collaborationRequest", {
        recipient: recipient._id.toString(),
      });
    }

    res.status(201).json({ message: "Request sent.", request: newRequest });
  } catch (error) {
    res.status(500).json({ message: "Error creating request.", error });
  }
};

exports.listRequests = async (req, res) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const type = req.query.type || "incoming";
    const filter = {};
    if (type === "incoming") {
      filter.recipient = user._id;
    } else if (type === "outgoing") {
      filter.requester = user._id;
    } else {
      filter.$or = [{ recipient: user._id }, { requester: user._id }];
    }

    const requests = await CollaborationRequest.find(filter)
      .sort({ createdAt: -1 })
      .populate("requester", "name email username roles skills interests expertise workplace")
      .populate("recipient", "name email username")
      .populate("idea", "title author estimatedBudget equityShare")
      .lean();

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests." });
  }
};

exports.respondToRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const user = await getUserByFirebaseUid(req.user.uid);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const request = await CollaborationRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.recipient.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to respond." });
    }

    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action." });
    }

    request.status = action === "accept" ? "accepted" : "rejected";
    request.respondedAt = new Date();
    await request.save();
    const ideaDoc = request.idea ? await Idea.findById(request.idea).select("title") : null;
    const ideaTitle = ideaDoc?.title;
    const io = req.app?.get("io");
    await logActivity({
      userId: request.requester,
      type: action === "accept" ? "collaboration_accepted" : "collaboration_rejected",
      title: action === "accept" ? "Collaboration accepted" : "Collaboration rejected",
      message: ideaTitle
        ? `Your collaboration request for "${ideaTitle}" was ${action}ed.`
        : `Your collaboration request was ${action}ed.`,
      link: "/activity",
      metadata: { requestId: request._id, action },
      io,
    });
    await logActivity({
      userId: request.recipient,
      type: action === "accept" ? "collaboration_confirmed" : "collaboration_rejected",
      title: action === "accept" ? "You accepted a collaboration" : "You rejected a collaboration",
      message: ideaTitle
        ? `You ${action}ed a collaboration for "${ideaTitle}".`
        : `You ${action}ed a collaboration request.`,
      link: "/activity",
      metadata: { requestId: request._id, action },
      io,
    });

    if (action === "accept" && request.idea) {
      const idea = await Idea.findById(request.idea);
      if (idea) {
        const ownerId = idea.author?.toString();
        const collaboratorId =
          ownerId === request.requester.toString()
            ? request.recipient
            : request.requester;
        idea.collaborators = idea.collaborators || [];
        if (!idea.collaborators.find((id) => id.toString() === collaboratorId.toString())) {
          idea.collaborators.push(collaboratorId);
          await idea.save();
          await logActivity({
            userId: collaboratorId,
            type: "collaboration_added",
            title: "Added as collaborator",
            message: idea.title
              ? `You are now a collaborator on "${idea.title}".`
              : "You were added as a collaborator.",
            link: `/idea/${idea._id}`,
            metadata: { ideaId: idea._id },
            io,
          });
        }
      }
    }

    res.json({ message: "Request updated.", request });
  } catch (error) {
    res.status(500).json({ message: "Error responding to request." });
  }
};
