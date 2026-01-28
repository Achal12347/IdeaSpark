const Message = require('../models/Message');
const Team = require('../models/Team');

exports.getMessages = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    // Check if user is a member of the team
    const team = await Team.findById(teamId);
    if (!team || !team.members.includes(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({ team: teamId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Check if user is a member of the team
    const team = await Team.findById(teamId);
    if (!team || !team.members.includes(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const newMessage = new Message({
      content,
      sender: userId,
      team: teamId,
    });

    await newMessage.save();
    await newMessage.populate('sender', 'name email');

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error });
  }
};
