const express = require("express");
const { createContactMessage, getContactMessages } = require("../controllers/contactController");
const verifyFirebaseToken = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

// POST /api/contact - Submit contact form
router.post("/", createContactMessage);

// GET /api/contact - Admin: read contact messages
router.get("/", verifyFirebaseToken, requireAdmin, getContactMessages);

module.exports = router;
