const Team = require('../models/Team');

exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find().populate('members', 'name email').populate('leader', 'name email');
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teams', error });
  }
};

exports.createTeam = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    const newTeam = new Team({
      name,
      leader: userId,
      members: [userId],
    });

    await newTeam.save();
    res.status(201).json(newTeam);
  } catch (error) {
    res.status(500).json({ message: 'Error creating team', error });
  }
};

exports.joinTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.members.includes(userId)) {
      return res.status(400).json({ message: 'Already a member of this team' });
    }

    team.members.push(userId);
    await team.save();
    res.json({ message: 'Joined team successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error joining team', error });
  }
};

exports.getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id).populate('members', 'name email').populate('leader', 'name email');
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team', error });
  }
};

exports.updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.id;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.leader.toString() !== userId) {
      return res.status(403).json({ message: 'Only team leader can update the team' });
    }

    team.name = name || team.name;
    await team.save();
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Error updating team', error });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.leader.toString() !== userId) {
      return res.status(403).json({ message: 'Only team leader can delete the team' });
    }

    await Team.findByIdAndDelete(id);
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting team', error });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId } = req.body;
    const userId = req.user.id;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.leader.toString() !== userId) {
      return res.status(403).json({ message: 'Only team leader can add members' });
    }

    if (team.members.includes(memberId)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    team.members.push(memberId);
    await team.save();
    res.json({ message: 'Member added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding member', error });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const userId = req.user.id;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.leader.toString() !== userId && memberId !== userId) {
      return res.status(403).json({ message: 'Unauthorized to remove member' });
    }

    team.members = team.members.filter(member => member.toString() !== memberId);
    await team.save();
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing member', error });
  }
};
