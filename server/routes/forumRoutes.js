const express = require('express');
const { createForum, getForums, getForum, addPost } = require('../controllers/forumController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/forums - Create a new forum
router.post('/', authenticateToken, createForum);

// GET /api/forums - Get all forums
router.get('/', getForums);

// GET /api/forums/:id - Get a specific forum
router.get('/:id', getForum);

// POST /api/forums/:id/posts - Add a post to a forum
router.post('/:id/posts', authenticateToken, addPost);

module.exports = router;
