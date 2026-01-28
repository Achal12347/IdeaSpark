const Idea = require('../models/Idea');
const Comment = require('../models/Comment');

exports.createIdea = async (req, res) => {
  try {
    const { title, problemStatement, solutionDescription, targetAudience, marketCategory, monetizationModel, stageOfIdea, lookingFor, estimatedBudget, equityShare, tags } = req.body;
    const author = req.user.uid; // Assuming auth middleware sets req.user

    const newIdea = new Idea({
      title,
      problemStatement,
      solutionDescription,
      targetAudience,
      marketCategory,
      monetizationModel,
      stageOfIdea,
      lookingFor,
      estimatedBudget,
      equityShare,
      tags,
      author,
    });

    await newIdea.save();
    res.status(201).json(newIdea);
  } catch (error) {
    res.status(500).json({ message: 'Error creating idea', error });
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

exports.getMyIdeas = async (req, res) => {
  try {
    const ideas = await Idea.find({ author: req.user.uid });
    res.json(ideas);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching my ideas', error });
  }
};

exports.rateIdea = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = req.user.uid;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const idea = await Idea.findById(id);
    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    // Check if user already rated
    const existingRating = idea.ratings.find(r => r.user.toString() === userId);
    if (existingRating) {
      return res.status(400).json({ message: 'You have already rated this idea' });
    }

    // Add new rating
    idea.ratings.push({ user: userId, rating });
    idea.totalRatings += 1;
    idea.averageRating = idea.ratings.reduce((sum, r) => sum + r.rating, 0) / idea.totalRatings;

    await idea.save();
    res.json({ message: 'Rating added successfully', averageRating: idea.averageRating });
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
    const { pitchContent } = req.body;
    const investor = req.user.uid;

    const idea = await Idea.findById(id);
    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    idea.pitches.push({ investor, pitchContent });
    await idea.save();
    res.json({ message: 'Pitch submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting pitch', error });
  }
};

exports.getPitches = async (req, res) => {
  try {
    const { id } = req.params;
    const idea = await Idea.findById(id).populate('pitches.investor', 'name email');
    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    res.json(idea.pitches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pitches', error });
  }
};
