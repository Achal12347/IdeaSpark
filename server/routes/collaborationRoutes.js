const express = require("express");
const verifyFirebaseToken = require("../middleware/authMiddleware");
const {
  createRequest,
  listRequests,
  respondToRequest,
} = require("../controllers/collaborationController");

const router = express.Router();

// GET /api/collaboration/requests?type=incoming|outgoing|all
router.get("/requests", verifyFirebaseToken, listRequests);

// POST /api/collaboration/requests
router.post("/requests", verifyFirebaseToken, createRequest);

// POST /api/collaboration/requests/:id/respond
router.post("/requests/:id/respond", verifyFirebaseToken, respondToRequest);

module.exports = router;
