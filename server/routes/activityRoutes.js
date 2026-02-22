const express = require("express");
const verifyFirebaseToken = require("../middleware/authMiddleware");
const {
  getActivity,
  dismissActivity,
} = require("../controllers/activityController");

const router = express.Router();

// GET /api/activity
router.get("/", verifyFirebaseToken, getActivity);

// POST /api/activity/dismiss (body: { type } or { ids })
router.post("/dismiss", verifyFirebaseToken, dismissActivity);

// POST /api/activity/:id/dismiss
router.post("/:id/dismiss", verifyFirebaseToken, dismissActivity);

module.exports = router;
