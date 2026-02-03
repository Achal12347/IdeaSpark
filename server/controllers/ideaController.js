const Idea = require('../models/Idea');
const Comment = require('../models/Comment');
const User = require('../models/User');
const IdeaMessage = require('../models/IdeaMessage');

const getUserByFirebaseUid = (uid) => User.findOne({ firebaseUID: uid });
const isInvestor = (user) => Array.isArray(user?.roles) && user.roles.includes('Investor');
const isOwnerOrCollaborator = (idea, userId) => {
  if (!idea || !userId) return false;
  if (idea.author?.toString() === userId.toString()) return true;
  return Array.isArray(idea.collaborators)
    && idea.collaborators.some((collabId) => collabId.toString() === userId.toString());
};

exports.createIdea = async (req, res) => {
  try {
    const { title, problemStatement, solutionDescription, targetAudience, marketCategory, monetizationModel, stageOfIdea, lookingFor, estimatedBudget, equityShare, tags } = req.body;
    const user = await User.findOne({ firebaseUID: req.user.uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newIdea = new Idea({
      title,
      problemStatement,
      solutionDescription,
      targetAudience,
      marketCategory,
      monetizationModel,
      stageOfIdea,
      lookingFor: lookingFor || [],
      estimatedBudget: estimatedBudget ? parseFloat(estimatedBudget) : undefined,
      equityShare: equityShare ? parseFloat(equityShare) : undefined,
      tags,
      author: user._id,
    });

    await newIdea.save();
    res.status(201).json(newIdea);
  } catch (error) {
    res.status(500).json({ message: 'Error creating idea', error });
  }
};

exports.getIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id).populate('author', 'name email');
    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }
    res.json(idea);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching idea', error });
  }
};

exports.incrementViews = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }
    idea.views += 1;
    await idea.save();
    res.json({ message: 'Views incremented' });
  } catch (error) {
    res.status(500).json({ message: 'Error incrementing views', error });
  }
};

exports.getIdeas = async (req, res) => {
  try {
    const ideas = await Idea.find().populate('author', 'name email');
    res.json(ideas);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ideas', error });
  }
};

exports.getTrendingIdeas = async (req, res) => {
  try {
    const ideas = await Idea.find()
      .populate('author', 'name email')
      .sort({ averageRating: -1, totalRatings: -1, views: -1, updatedAt: -1 })
      .limit(20);
    res.json(ideas);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trending ideas', error });
  }
};

exports.getMyIdeas = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUID: req.user.uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const ideas = await Idea.find({ author: user._id });
    res.json(ideas);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching my ideas', error });
  }
};

exports.getCollaboratorIdeas = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUID: req.user.uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const ideas = await Idea.find({
      collaborators: user._id,
      author: { $ne: user._id },
    }).populate('author', 'name email');

    res.json(ideas);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching collaborator ideas', error });
  }
};

exports.getIdeaMessages = async (req, res) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const idea = await Idea.findById(req.params.id);
    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    if (!isOwnerOrCollaborator(idea, user._id)) {
      return res.status(403).json({ message: 'Not authorized to view messages.' });
    }

    const messages = await IdeaMessage.find({ idea: idea._id })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error });
  }
};

exports.postIdeaMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required.' });
    }

    const idea = await Idea.findById(req.params.id);
    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    if (!isOwnerOrCollaborator(idea, user._id)) {
      return res.status(403).json({ message: 'Not authorized to send messages.' });
    }

    const message = await IdeaMessage.create({
      content: content.trim(),
      sender: user._id,
      idea: idea._id,
    });

    await message.populate('sender', 'name email');
    const io = req.app?.get('io');
    if (io) {
      io.to(`idea:${idea._id}`).emit('newIdeaMessage', message);
    }
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error });
  }
};
exports.pitchIdea = async (req, res) => {
  try {
    const { id } = req.params;
    const { pitchMessage, estimatedBudget, equityShare } = req.body;
    const user = await User.findOne({ firebaseUID: req.user.uid });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const idea = await Idea.findById(id);
    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    const isOwner = idea.author?.toString() === user._id.toString();
    if (!isOwner) {
      return res.status(403).json({ message: 'Only the idea owner can pitch this idea.' });
    }

    if (!pitchMessage || !pitchMessage.trim()) {
      return res.status(400).json({ message: 'Pitch message is required.' });
    }

    if (estimatedBudget !== undefined && estimatedBudget !== '') {
      idea.estimatedBudget = parseFloat(estimatedBudget);
    }
    if (equityShare !== undefined && equityShare !== '') {
      idea.equityShare = parseFloat(equityShare);
    }

    idea.pitchMessage = pitchMessage.trim();
    idea.isPitched = true;
    idea.pitchedAt = new Date();

    await idea.save();
    res.json({ message: 'Idea pitched successfully', idea });
  } catch (error) {
    res.status(500).json({ message: 'Error pitching idea', error });
  }
};

exports.rateIdea = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const user = await getUserByFirebaseUid(req.user.uid);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const normalizedRating = Number(rating);
    if (normalizedRating < 1 || normalizedRating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const idea = await Idea.findById(id);
    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    const existingRating = idea.ratings.find(
      (r) => r.user?.toString() === user._id.toString()
    );
    if (existingRating) {
      existingRating.rating = normalizedRating;
    } else {
      idea.ratings.push({ user: user._id, rating: normalizedRating });
    }
    idea.totalRatings = idea.ratings.length;
    idea.averageRating =
      idea.totalRatings > 0
        ? idea.ratings.reduce((sum, r) => sum + r.rating, 0) / idea.totalRatings
        : 0;

    await idea.save();
    res.json({
      message: 'Rating saved successfully',
      averageRating: idea.averageRating,
      totalRatings: idea.totalRatings,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error rating idea', error });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const author = req.user.uid;

    const idea = await Idea.findById(id);
    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    const newComment = new Comment({
      content,
      idea: id,
      author,
    });

    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await Comment.find({ idea: id }).populate('author', 'name email').sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error });
  }
};

exports.submitPitch = async (req, res) => {
  try {
    const { id } = req.params;
    const { pitchContent, amount, equity } = req.body;
    const investorUser = await getUserByFirebaseUid(req.user.uid);

    if (!investorUser || !isInvestor(investorUser)) {
      return res.status(403).json({ message: 'Investor role required to submit offers.' });
    }

    if (!pitchContent || !pitchContent.trim()) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    const idea = await Idea.findById(id);
    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    if (idea.fundingStatus === 'funded') {
      return res.status(400).json({ message: 'This idea is already funded.' });
    }

    const existingOffer = idea.pitches.find(
      (pitch) => pitch.investor?.toString() === investorUser._id.toString() && pitch.status !== 'funded'
    );

    const normalizedAmount = amount !== undefined && amount !== '' ? parseFloat(amount) : undefined;
    const normalizedEquity = equity !== undefined && equity !== '' ? parseFloat(equity) : undefined;

    if (existingOffer) {
      existingOffer.pitchContent = pitchContent.trim();
      existingOffer.amount = normalizedAmount;
      existingOffer.equity = normalizedEquity;
      existingOffer.status = 'pending';
      existingOffer.counterOffer = undefined;
      existingOffer.updatedAt = new Date();
    } else {
      idea.pitches.push({
        investor: investorUser._id,
        pitchContent: pitchContent.trim(),
        amount: normalizedAmount,
        equity: normalizedEquity,
        status: 'pending',
        createdAt: new Date(),
      });
    }
    await idea.save();
    res.json({ message: 'Offer submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting pitch', error });
  }
};

exports.getPitches = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserByFirebaseUid(req.user.uid);
    const idea = await Idea.findById(id).populate('pitches.investor', 'name email username');
    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    const isOwner = user && idea.author?.toString() === user._id.toString();
    if (!isOwner && user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view offers.' });
    }

    res.json(idea.pitches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pitches', error });
  }
};

exports.getInvestorOffers = async (req, res) => {
  try {
    const investorUser = await getUserByFirebaseUid(req.user.uid);
    if (!investorUser || !isInvestor(investorUser)) {
      return res.status(403).json({ message: 'Investor role required.' });
    }

    const ideas = await Idea.find({ 'pitches.investor': investorUser._id }).select('title pitches fundingStatus');

    const offers = ideas.flatMap((idea) =>
      idea.pitches
        .filter((pitch) => pitch.investor?.toString() === investorUser._id.toString())
        .map((pitch) => ({
          ideaId: idea._id,
          ideaTitle: idea.title,
          fundingStatus: idea.fundingStatus,
          offer: pitch,
        }))
    );

    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching investor offers.' });
  }
};

exports.respondToPitch = async (req, res) => {
  try {
    const { id, pitchId } = req.params;
    const { action, counterAmount, counterEquity, counterMessage } = req.body;
    const user = await getUserByFirebaseUid(req.user.uid);

    const idea = await Idea.findById(id);
    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    const isOwner = user && idea.author?.toString() === user._id.toString();
    if (!isOwner) {
      return res.status(403).json({ message: 'Only the idea owner can respond to offers.' });
    }

    const pitch = idea.pitches.id(pitchId);
    if (!pitch) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    if (action === 'accept') {
      pitch.status = 'owner_accepted';
      pitch.updatedAt = new Date();
    } else if (action === 'reject') {
      pitch.status = 'rejected';
      pitch.updatedAt = new Date();
    } else if (action === 'counter') {
      const hasCounter =
        counterAmount !== undefined ||
        counterEquity !== undefined ||
        (counterMessage && counterMessage.trim());
      if (!hasCounter) {
        return res.status(400).json({ message: 'Counter offer needs details.' });
      }

      pitch.status = 'countered';
      pitch.counterOffer = {
        amount: counterAmount !== undefined && counterAmount !== '' ? parseFloat(counterAmount) : undefined,
        equity: counterEquity !== undefined && counterEquity !== '' ? parseFloat(counterEquity) : undefined,
        message: counterMessage ? counterMessage.trim() : '',
        createdAt: new Date(),
      };
      pitch.updatedAt = new Date();
    } else {
      return res.status(400).json({ message: 'Invalid action.' });
    }

    await idea.save();
    res.json({ message: 'Offer updated', offer: pitch });
  } catch (error) {
    res.status(500).json({ message: 'Error updating offer.' });
  }
};

exports.confirmPitch = async (req, res) => {
  try {
    const { id, pitchId } = req.params;
    const investorUser = await getUserByFirebaseUid(req.user.uid);

    if (!investorUser || !isInvestor(investorUser)) {
      return res.status(403).json({ message: 'Investor role required.' });
    }

    const idea = await Idea.findById(id);
    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    const pitch = idea.pitches.id(pitchId);
    if (!pitch) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    if (pitch.investor?.toString() !== investorUser._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to confirm this offer.' });
    }

    if (!['owner_accepted', 'countered'].includes(pitch.status)) {
      return res.status(400).json({ message: 'Offer is not ready for confirmation.' });
    }

    pitch.status = 'funded';
    pitch.updatedAt = new Date();
    idea.fundingStatus = 'funded';

    if (!idea.collaborators) {
      idea.collaborators = [];
    }
    if (!idea.collaborators.find((id) => id.toString() === investorUser._id.toString())) {
      idea.collaborators.push(investorUser._id);
    }

    idea.pitches.forEach((otherPitch) => {
      if (otherPitch._id.toString() !== pitchId && otherPitch.status !== 'funded') {
        otherPitch.status = 'rejected';
        otherPitch.updatedAt = new Date();
      }
    });

    await idea.save();
    res.json({ message: 'Idea funded successfully.', offer: pitch });
  } catch (error) {
    res.status(500).json({ message: 'Error confirming offer.' });
  }
};

exports.showInterest = async (req, res) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const idea = await Idea.findById(req.params.id);
    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    if (!idea.interestedUsers) {
      idea.interestedUsers = [];
    }

    const alreadyInterested = idea.interestedUsers.find(
      (userId) => userId.toString() === user._id.toString()
    );

    if (!alreadyInterested) {
      idea.interestedUsers.push(user._id);
      await idea.save();
    }

    res.json({
      message: 'Interest recorded',
      interestCount: idea.interestedUsers.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error recording interest.' });
  }
};
