const express = require('express');
const { createIdea, getIdeas, getMyIdeas } = require('../controllers/ideaController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/ideas - Create a new idea
router.post('/', authenticateToken, createIdea);

// GET /api/ideas - Get all ideas
router.get('/', getIdeas);

// GET /api/ideas/my - Get user's ideas
router.get('/my', authenticateToken, getMyIdeas);

module.exports = router;
