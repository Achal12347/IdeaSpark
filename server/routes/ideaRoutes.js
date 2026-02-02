const express = require('express');
const { createIdea, getIdea, getIdeas, getMyIdeas, rateIdea, addComment, getComments, submitPitch, getPitches, incrementViews } = require('../controllers/ideaController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/ideas - Create a new idea
router.post('/', authenticateToken, createIdea);

// GET /api/ideas - Get all ideas
router.get('/', getIdeas);

// GET /api/ideas/my - Get user's ideas
router.get('/my', authenticateToken, getMyIdeas);

// GET /api/ideas/:id - Get a single idea
router.get('/:id', getIdea);

// POST /api/ideas/:id/rate - Rate an idea
router.post('/:id/rate', authenticateToken, rateIdea);

// POST /api/ideas/:id/comments - Add a comment to an idea
router.post('/:id/comments', authenticateToken, addComment);

// GET /api/ideas/:id/comments - Get comments for an idea
router.get('/:id/comments', getComments);

// POST /api/ideas/:id/views - Increment views for an idea
router.post('/:id/views', incrementViews);

module.exports = router;
