const express = require('express');
const router = express.Router();
const { getConversations, getMessages, sendMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.route('/conversations').get(protect, getConversations);
router.route('/messages').post(protect, sendMessage);
router.route('/messages/:conversationId').get(protect, getMessages);

module.exports = router;
