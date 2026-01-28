const Hackathon = require('../models/Hackathon');

exports.createHackathon = async (req, res) => {
  try {
    const { name, description, startDate, endDate, judges } = req.body;
    const newHackathon = new Hackathon({
      name,
      description,
      startDate,
      endDate,
      judges,
    });
    await newHackathon.save();
    res.status(201).json(newHackathon);
  } catch (error) {
    res.status(500).json({ message: 'Error creating hackathon', error });
  }
};

exports.getHackathons = async (req, res) => {
  try {
    const hackathons = await Hackathon.find().populate('judges', 'name email');
    res.json(hackathons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hackathons', error });
  }
};

exports.submitToHackathon = async (req, res) => {
  try {
    const { id } = req.params;
    const { ideaId } = req.body;
    const userId = req.user.id;

    const hackathon = await Hackathon.findById(id);
    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }

    hackathon.submissions.push({ idea: ideaId, team: userId });
    await hackathon.save();
    res.json({ message: 'Submission successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting to hackathon', error });
  }
};

exports.judgeSubmission = async (req, res) => {
  try {
    const { id, submissionId } = req.params;
    const { score, feedback } = req.body;
    const judgeId = req.user.id;

    const hackathon = await Hackathon.findById(id);
    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }

    const submission = hackathon.submissions.id(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.judges.push({ judge: judgeId, score, feedback });
    // Calculate average score
    const totalScore = submission.judges.reduce((sum, j) => sum + j.score, 0);
    submission.averageScore = totalScore / submission.judges.length;

    await hackathon.save();
    res.json({ message: 'Judging completed' });
  } catch (error) {
    res.status(500).json({ message: 'Error judging submission', error });
  }
};

exports.getRankings = async (req, res) => {
  try {
    const { id } = req.params;
    const hackathon = await Hackathon.findById(id).populate('submissions.idea', 'title').populate('submissions.team', 'name');
    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }

    const rankings = hackathon.submissions
      .filter(sub => sub.averageScore !== undefined)
      .sort((a, b) => b.averageScore - a.averageScore);

    res.json(rankings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rankings', error });
  }
};
