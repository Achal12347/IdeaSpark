const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const directMessageController = require("../controllers/directMessageController");

const router = express.Router();

router.get("/conversations", authMiddleware, directMessageController.getConversations);
router.get("/thread/:userId", authMiddleware, directMessageController.getThread);
router.post("/", authMiddleware, directMessageController.sendMessage);

module.exports = router;
