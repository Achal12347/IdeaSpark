const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:teamId', authMiddleware, messageController.getMessages);
router.post('/:teamId', authMiddleware, messageController.sendMessage);

module.exports = router;
