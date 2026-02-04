const Hackathon = require("../models/Hackathon");
const HackathonParticipant = require("../models/HackathonParticipant");
const HackathonTeam = require("../models/HackathonTeam");
const HackathonSubmission = require("../models/HackathonSubmission");
const HackathonEvaluation = require("../models/HackathonEvaluation");
const User = require("../models/User");

const getUserByFirebaseUid = (uid) => User.findOne({ firebaseUID: uid });

const computeStatus = (hackathon) => {
  const now = new Date();
  if (now < hackathon.registrationStart) return "upcoming";
  if (now <= hackathon.submissionDeadline) return "active";
  if (now > hackathon.submissionDeadline) return "completed";
  return hackathon.status || "upcoming";
};

exports.createHackathon = async (req, res) => {
  try {
    const organizer = await getUserByFirebaseUid(req.user.uid);
    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found" });
    }

    const {
      title,
      description,
      theme,
      banner,
      registrationStart,
      registrationEnd,
      submissionDeadline,
      resultAnnouncement,
      teamLimit,
      rules,
      allowedTechnologies,
      submissionFormat,
      judgingCriteria,
      prizes,
      certificates,
    } = req.body;

    const hackathon = await Hackathon.create({
      title,
      description,
      theme,
      banner,
      registrationStart,
      registrationEnd,
      submissionDeadline,
      resultAnnouncement,
      teamLimit,
      rules: rules || [],
      allowedTechnologies: allowedTechnologies || [],
      submissionFormat: submissionFormat || [],
      judgingCriteria: judgingCriteria || [],
      prizes: prizes || [],
      certificates,
      organizer: organizer._id,
      status: "upcoming",
      councilAdmins: [],
      launchConfirmations: [],
      winnerConfirmations: [],
    });

    res.status(201).json(hackathon);
  } catch (error) {
    res.status(500).json({ message: "Error creating hackathon", error });
  }
};

exports.getHackathons = async (req, res) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    const hackathons = await Hackathon.find().sort({ registrationStart: -1 });

    const hackathonIds = hackathons.map((hackathon) => hackathon._id);
    const participants = user
      ? await HackathonParticipant.find({
          hackathon: { $in: hackathonIds },
          user: user._id,
        })
      : [];
    const teams = user
      ? await HackathonTeam.find({
          hackathon: { $in: hackathonIds },
          members: user._id,
        })
      : [];
    const submissions = user
      ? await HackathonSubmission.find({
          hackathon: { $in: hackathonIds },
          team: { $in: teams.map((team) => team._id) },
        })
      : [];

    const participantMap = new Set(participants.map((item) => item.hackathon.toString()));
    const teamMap = new Map(teams.map((team) => [team.hackathon.toString(), team]));
    const submissionMap = new Map(
      submissions.map((submission) => [submission.hackathon.toString(), submission])
    );

    const enriched = await Promise.all(
      hackathons.map(async (hackathon) => {
        const status = computeStatus(hackathon);
        const participantCount = await HackathonParticipant.countDocuments({
          hackathon: hackathon._id,
        });
        const submissionCount = await HackathonSubmission.countDocuments({
          hackathon: hackathon._id,
        });
        return {
          ...hackathon.toObject(),
          status,
          participantCount,
          submissionCount,
          isRegistered: participantMap.has(hackathon._id.toString()),
          myTeam: teamMap.get(hackathon._id.toString()) || null,
          mySubmission: submissionMap.get(hackathon._id.toString()) || null,
        };
      })
    );

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: "Error fetching hackathons", error });
  }
};

exports.register = async (req, res) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    const now = new Date();
    if (now < hackathon.registrationStart || now > hackathon.registrationEnd) {
      return res.status(400).json({ message: "Registration is closed." });
    }

    await HackathonParticipant.findOneAndUpdate(
      { hackathon: hackathon._id, user: user._id },
      { hackathon: hackathon._id, user: user._id, joinedAt: new Date() },
      { upsert: true }
    );
    const io = req.app?.get("io");
    if (io) {
      io.emit("hackathonUpdated", hackathon._id.toString());
    }

    res.json({ message: "Registered successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error registering", error });
  }
};

exports.createTeam = async (req, res) => {
  try {
    const { name, memberEmails } = req.body;
    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    const participant = await HackathonParticipant.findOne({
      hackathon: hackathon._id,
      user: user._id,
    });
    if (!participant) {
      return res.status(400).json({ message: "Register before creating a team." });
    }

    const emails = Array.isArray(memberEmails) ? memberEmails : [];
    const members = await User.find({
      email: { $in: emails.filter(Boolean) },
    }).select("_id");

    const memberIds = new Set([user._id.toString()]);
    members.forEach((member) => memberIds.add(member._id.toString()));

    if (hackathon.teamLimit && memberIds.size > hackathon.teamLimit) {
      return res.status(400).json({ message: "Team limit exceeded." });
    }

    const team = await HackathonTeam.create({
      hackathon: hackathon._id,
      name,
      leader: user._id,
      members: Array.from(memberIds),
    });
    const io = req.app?.get("io");
    if (io) {
      io.emit("hackathonUpdated", hackathon._id.toString());
    }

    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: "Error creating team", error });
  }
};

exports.getTeams = async (req, res) => {
  try {
    const teams = await HackathonTeam.find({ hackathon: req.params.id }).populate(
      "members",
      "name email"
    );
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: "Error fetching teams", error });
  }
};

exports.submit = async (req, res) => {
  try {
    const {
      teamId,
      title,
      description,
      problemStatement,
      solutionExplanation,
      githubLink,
      demoLink,
      files,
    } = req.body;

    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    const now = new Date();
    if (now > hackathon.submissionDeadline) {
      return res.status(400).json({ message: "Submission window is closed." });
    }

    const team = await HackathonTeam.findById(teamId);
    if (!team || team.hackathon.toString() !== hackathon._id.toString()) {
      return res.status(400).json({ message: "Invalid team." });
    }

    const isMember = team.members.some((member) => member.toString() === user._id.toString());
    if (!isMember) {
      return res.status(403).json({ message: "You are not part of this team." });
    }

    const submission = await HackathonSubmission.findOneAndUpdate(
      { hackathon: hackathon._id, team: team._id },
      {
        hackathon: hackathon._id,
        team: team._id,
        title,
        description,
        problemStatement,
        solutionExplanation,
        githubLink,
        demoLink,
        files: Array.isArray(files) ? files : [],
        submittedAt: new Date(),
      },
      { upsert: true, new: true }
    );
    const io = req.app?.get("io");
    if (io) {
      io.emit("hackathonUpdated", hackathon._id.toString());
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: "Error submitting project", error });
  }
};

exports.getSubmissions = async (req, res) => {
  try {
    const submissions = await HackathonSubmission.find({ hackathon: req.params.id })
      .populate("team", "name")
      .populate("hackathon", "title");
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching submissions", error });
  }
};

exports.judgeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { scores, feedback } = req.body;
    const judge = await getUserByFirebaseUid(req.user.uid);

    if (!judge) {
      return res.status(404).json({ message: "Judge not found" });
    }

    const submission = await HackathonSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const totalScore =
      (scores?.innovation || 0) +
      (scores?.feasibility || 0) +
      (scores?.design || 0) +
      (scores?.technical || 0) +
      (scores?.impact || 0);

    await HackathonEvaluation.findOneAndUpdate(
      { submission: submission._id, judge: judge._id },
      {
        submission: submission._id,
        judge: judge._id,
        scores,
        feedback,
        totalScore,
      },
      { upsert: true, new: true }
    );

    const evaluations = await HackathonEvaluation.find({ submission: submission._id });
    const avgScore =
      evaluations.reduce((sum, evaluation) => sum + (evaluation.totalScore || 0), 0) /
      (evaluations.length || 1);
    submission.averageScore = avgScore;
    await submission.save();
    const io = req.app?.get("io");
    if (io) {
      io.emit("hackathonUpdated", submission.hackathon.toString());
    }

    res.json({ message: "Judging completed", averageScore: avgScore });
  } catch (error) {
    res.status(500).json({ message: "Error judging submission", error });
  }
};

exports.getRankings = async (req, res) => {
  try {
    const submissions = await HackathonSubmission.find({ hackathon: req.params.id })
      .populate("team", "name")
      .sort({ averageScore: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rankings", error });
  }
};

exports.announceResults = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    const submissions = await HackathonSubmission.find({ hackathon: hackathon._id })
      .sort({ averageScore: -1 })
      .limit(3);

    hackathon.winners = submissions.map((submission) => submission._id);
    await hackathon.save();
    const io = req.app?.get("io");
    if (io) {
      io.emit("hackathonUpdated", hackathon._id.toString());
    }

    res.json({ message: "Winners announced.", winners: hackathon.winners });
  } catch (error) {
    res.status(500).json({ message: "Error announcing results", error });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    const participantCount = await HackathonParticipant.countDocuments({
      hackathon: hackathon._id,
    });
    const submissionCount = await HackathonSubmission.countDocuments({
      hackathon: hackathon._id,
    });
    const teamsCount = await HackathonTeam.countDocuments({
      hackathon: hackathon._id,
    });

    res.json({
      participantCount,
      submissionCount,
      teamsCount,
      theme: hackathon.theme || "N/A",
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching analytics", error });
  }
};

exports.setCouncil = async (req, res) => {
  try {
    const { adminIds, hostId } = req.body;
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    if (!Array.isArray(adminIds) || adminIds.length !== 4) {
      return res.status(400).json({ message: "Select exactly four admins." });
    }

    if (!adminIds.includes(hostId)) {
      return res.status(400).json({ message: "Host must be one of the four admins." });
    }

    const adminUsers = await User.find({ _id: { $in: adminIds }, role: "admin" });
    if (adminUsers.length !== 4) {
      return res.status(400).json({ message: "All selected users must be admins." });
    }

    hackathon.councilAdmins = adminIds;
    hackathon.hostAdmin = hostId;
    hackathon.launchConfirmations = [];
    hackathon.winnerConfirmations = [];
    hackathon.status = "upcoming";
    await hackathon.save();
    const io = req.app?.get("io");
    if (io) {
      io.emit("hackathonUpdated", hackathon._id.toString());
    }

    res.json({ message: "Council set.", hackathon });
  } catch (error) {
    res.status(500).json({ message: "Error setting council", error });
  }
};

exports.confirmLaunch = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isCouncil = hackathon.councilAdmins?.some(
      (adminId) => adminId.toString() === user._id.toString()
    );
    if (!isCouncil) {
      return res.status(403).json({ message: "Council admin required." });
    }

    hackathon.launchConfirmations = hackathon.launchConfirmations || [];
    if (!hackathon.launchConfirmations.find((id) => id.toString() === user._id.toString())) {
      hackathon.launchConfirmations.push(user._id);
    }

    if (hackathon.launchConfirmations.length === 4) {
      hackathon.status = "active";
    }

    await hackathon.save();
    const io = req.app?.get("io");
    if (io) {
      io.emit("hackathonUpdated", hackathon._id.toString());
    }
    res.json({ message: "Launch confirmation recorded.", hackathon });
  } catch (error) {
    res.status(500).json({ message: "Error confirming launch", error });
  }
};

exports.confirmWinners = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isCouncil = hackathon.councilAdmins?.some(
      (adminId) => adminId.toString() === user._id.toString()
    );
    if (!isCouncil) {
      return res.status(403).json({ message: "Council admin required." });
    }

    hackathon.winnerConfirmations = hackathon.winnerConfirmations || [];
    if (!hackathon.winnerConfirmations.find((id) => id.toString() === user._id.toString())) {
      hackathon.winnerConfirmations.push(user._id);
    }

    if (hackathon.winnerConfirmations.length === 4) {
      hackathon.status = "completed";
    }

    await hackathon.save();
    const io = req.app?.get("io");
    if (io) {
      io.emit("hackathonUpdated", hackathon._id.toString());
    }
    res.json({ message: "Winner confirmation recorded.", hackathon });
  } catch (error) {
    res.status(500).json({ message: "Error confirming winners", error });
  }
};
