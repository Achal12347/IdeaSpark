const Idea = require('../models/Idea');
const User = require('../models/User');
const Comment = require('../models/Comment');
const CollaborationRequest = require('../models/CollaborationRequest');

exports.getAnalytics = async (req, res) => {
  try {
    // Total ideas
    const totalIdeas = await Idea.countDocuments({ isDeleted: { $ne: true } });

    // Total users
    const totalUsers = await User.countDocuments({ isDeleted: { $ne: true } });

    // Total comments
    const totalComments = await Comment.countDocuments();

    // Trending ideas (by average rating, top 5)
    const trendingIdeas = await Idea.find({ isDeleted: { $ne: true } })
      .sort({ averageRating: -1 })
      .limit(5)
      .populate('author', 'name');

    // Ideas by category
    const ideasByCategory = await Idea.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$marketCategory', count: { $sum: 1 } } }
    ]);

    // User engagement (ideas per user, average)
    const userEngagement = await Idea.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$author', ideaCount: { $sum: 1 } } },
      { $group: { _id: null, avgIdeasPerUser: { $avg: '$ideaCount' } } }
    ]);

    // Top users by idea count
    const topUsers = await Idea.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$author', ideaCount: { $sum: 1 }, totalViews: { $sum: '$views' } } },
      { $sort: { ideaCount: -1, totalViews: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { _id: 0, userId: '$_id', name: '$user.name', email: '$user.email', roles: '$user.roles', ideaCount: 1, totalViews: 1 } }
    ]);

    // Top ideas by views
    const topIdeas = await Idea.find({ isDeleted: { $ne: true } })
      .sort({ views: -1, averageRating: -1 })
      .limit(5)
      .select('title views averageRating totalRatings');

    // Average rating across ideas
    const ratingAgg = await Idea.aggregate([
      { $match: { isDeleted: { $ne: true }, totalRatings: { $gt: 0 } } },
      { $group: { _id: null, avgRating: { $avg: '$averageRating' } } }
    ]);
    const averageRating = ratingAgg[0]?.avgRating || 0;

    // Total investors
    const totalInvestors = await User.countDocuments({ roles: { $in: ['Investor'] }, isDeleted: { $ne: true } });

    // Total investment (sum of funded pitches)
    const investmentAgg = await Idea.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $unwind: '$pitches' },
      { $match: { 'pitches.status': 'funded', 'pitches.amount': { $ne: null } } },
      { $group: { _id: null, total: { $sum: '$pitches.amount' } } }
    ]);
    const totalInvestment = investmentAgg[0]?.total || 0;

    // Total connections (accepted collaborations)
    const totalConnections = await CollaborationRequest.countDocuments({ status: 'accepted' });

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const newUsersWeek = await User.countDocuments({
      isDeleted: { $ne: true },
      createdAt: { $gte: weekAgo },
    });

    const newIdeasWeek = await Idea.countDocuments({
      isDeleted: { $ne: true },
      createdAt: { $gte: weekAgo },
    });

    const activeInvestors = await User.countDocuments({
      roles: { $in: ['Investor'] },
      isDeleted: { $ne: true },
      updatedAt: { $gte: weekAgo },
    });

    res.json({
      totalIdeas,
      totalUsers,
      totalComments,
      trendingIdeas,
      ideasByCategory,
      avgIdeasPerUser: userEngagement[0]?.avgIdeasPerUser || 0,
      topUsers,
      topIdeas,
      averageRating,
      totalInvestors,
      totalInvestment,
      totalConnections,
      newUsersWeek,
      newIdeasWeek,
      activeInvestors,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error });
  }
};
