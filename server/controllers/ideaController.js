const Idea = require('../models/Idea');

exports.createIdea = async (req, res) => {
  try {
    const { title, problemStatement, solutionDescription, targetAudience, marketCategory, monetizationModel, stageOfIdea, lookingFor, estimatedBudget, equityShare, tags } = req.body;
    const author = req.user.id; // Assuming auth middleware sets req.user

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
    const ideas = await Idea.find({ author: req.user.id });
    res.json(ideas);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching my ideas', error });
  }
};
