const express = require('express');
const { getAnalytics } = require('../controllers/analyticsController');

const router = express.Router();

// GET /api/analytics - Get analytics data
router.get('/', getAnalytics);

module.exports = router;
