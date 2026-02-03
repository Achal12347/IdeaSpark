const express = require('express');
const {
  createIdea,
  getIdea,
  getIdeas,
  getMyIdeas,
  getCollaboratorIdeas,
  getIdeaMessages,
  postIdeaMessage,
  pitchIdea,
  rateIdea,
  addComment,
  getComments,
  submitPitch,
  getPitches,
  getInvestorOffers,
  respondToPitch,
  confirmPitch,
  incrementViews,
  showInterest,
} = require('../controllers/ideaController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/ideas - Create a new idea
router.post('/', authenticateToken, createIdea);

// GET /api/ideas - Get all ideas
router.get('/', getIdeas);

// GET /api/ideas/investor/offers - Investor offers
router.get('/investor/offers', authenticateToken, getInvestorOffers);

// GET /api/ideas/my - Get user's ideas
router.get('/my', authenticateToken, getMyIdeas);

// GET /api/ideas/collaborations - Ideas where user is a collaborator
router.get('/collaborations', authenticateToken, getCollaboratorIdeas);

// POST /api/ideas/:id/pitch - Pitch idea to investors
router.post('/:id/pitch', authenticateToken, pitchIdea);

// GET /api/ideas/:id - Get a single idea
router.get('/:id', getIdea);

// POST /api/ideas/:id/rate - Rate an idea
router.post('/:id/rate', authenticateToken, rateIdea);

// POST /api/ideas/:id/comments - Add a comment to an idea
router.post('/:id/comments', authenticateToken, addComment);

// GET /api/ideas/:id/comments - Get comments for an idea
router.get('/:id/comments', getComments);

// POST /api/ideas/:id/pitches - Submit funding offer
router.post('/:id/pitches', authenticateToken, submitPitch);

// GET /api/ideas/:id/pitches - Owner/admin view offers
router.get('/:id/pitches', authenticateToken, getPitches);

// POST /api/ideas/:id/pitches/:pitchId/respond - Owner responds
router.post('/:id/pitches/:pitchId/respond', authenticateToken, respondToPitch);

// POST /api/ideas/:id/pitches/:pitchId/confirm - Investor confirms
router.post('/:id/pitches/:pitchId/confirm', authenticateToken, confirmPitch);

// POST /api/ideas/:id/views - Increment views for an idea
router.post('/:id/views', incrementViews);

// POST /api/ideas/:id/interest - Record interest in an idea
router.post('/:id/interest', authenticateToken, showInterest);

// Idea collaboration messages
router.get('/:id/messages', authenticateToken, getIdeaMessages);
router.post('/:id/messages', authenticateToken, postIdeaMessage);

module.exports = router;
