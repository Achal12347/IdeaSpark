const Idea = require('../models/Idea');
const User = require('../models/User');
const Comment = require('../models/Comment');

exports.getAnalytics = async (req, res) => {
  try {
    // Total ideas
    const totalIdeas = await Idea.countDocuments();

    // Total users
    const totalUsers = await User.countDocuments();

    // Total comments
    const totalComments = await Comment.countDocuments();

    // Trending ideas (by average rating, top 5)
    const trendingIdeas = await Idea.find()
      .sort({ averageRating: -1 })
      .limit(5)
      .populate('author', 'name');

    // Ideas by category
    const ideasByCategory = await Idea.aggregate([
      { $group: { _id: '$marketCategory', count: { $sum: 1 } } }
    ]);

    // User engagement (ideas per user, average)
    const userEngagement = await Idea.aggregate([
      { $group: { _id: '$author', ideaCount: { $sum: 1 } } },
      { $group: { _id: null, avgIdeasPerUser: { $avg: '$ideaCount' } } }
    ]);

    res.json({
      totalIdeas,
      totalUsers,
      totalComments,
      trendingIdeas,
      ideasByCategory,
      avgIdeasPerUser: userEngagement[0]?.avgIdeasPerUser || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error });
  }
};
