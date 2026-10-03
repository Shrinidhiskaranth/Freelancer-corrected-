const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const verifyToken = require('../middleware/authMiddleware');

// All message routes require authentication
router.use(verifyToken);

router.post('/send', messageController.sendMessage);
router.get('/conversations', messageController.getConversations);
router.get('/:projectId/:otherUserId', messageController.getConversationMessages);

module.exports = router;
