const express = require('express');
const router = express.Router();
const hackathonController = require('../controllers/hackathonController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, hackathonController.getHackathons);
router.post('/', authMiddleware, roleMiddleware(['admin']), hackathonController.createHackathon);
router.post('/:id/submit', authMiddleware, hackathonController.submitToHackathon);
router.post('/:id/submissions/:submissionId/judge', authMiddleware, roleMiddleware(['admin']), hackathonController.judgeSubmission);
router.get('/:id/rankings', authMiddleware, hackathonController.getRankings);

module.exports = router;
