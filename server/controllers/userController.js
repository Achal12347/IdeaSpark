const User = require('../models/User');

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { name, expertise, workplace } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, expertise, workplace },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user profile', error });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-firebaseUID');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};
