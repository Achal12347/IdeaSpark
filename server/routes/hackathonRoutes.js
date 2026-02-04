const express = require("express");
const hackathonController = require("../controllers/hackathonController");
const authMiddleware = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", authMiddleware, hackathonController.getHackathons);
router.post("/", authMiddleware, requireAdmin, hackathonController.createHackathon);
router.post("/:id/register", authMiddleware, hackathonController.register);
router.post("/:id/teams", authMiddleware, hackathonController.createTeam);
router.get("/:id/teams", authMiddleware, requireAdmin, hackathonController.getTeams);
router.post("/:id/submit", authMiddleware, hackathonController.submit);
router.get("/:id/submissions", authMiddleware, requireAdmin, hackathonController.getSubmissions);
router.post(
  "/:id/submissions/:submissionId/judge",
  authMiddleware,
  requireAdmin,
  hackathonController.judgeSubmission
);
router.get("/:id/rankings", authMiddleware, hackathonController.getRankings);
router.post("/:id/announce", authMiddleware, requireAdmin, hackathonController.announceResults);
router.get("/:id/analytics", authMiddleware, requireAdmin, hackathonController.getAnalytics);
router.post("/:id/council", authMiddleware, requireAdmin, hackathonController.setCouncil);
router.post("/:id/confirm-launch", authMiddleware, requireAdmin, hackathonController.confirmLaunch);
router.post("/:id/confirm-winners", authMiddleware, requireAdmin, hackathonController.confirmWinners);

module.exports = router;
