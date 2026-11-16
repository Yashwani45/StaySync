const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get user conversations
// @route   GET /api/chat/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
      .populate('participants', 'name profileImage role')
      .sort({ updatedAt: -1 });

    res.json({ success: true, count: conversations.length, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get messages inside a conversation
// @route   GET /api/chat/messages/:conversationId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    // Verify conversation exists and user is participant
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(req.user.id)) {
      return res.status(401).json({ success: false, message: 'Not authorized to view this thread' });
    }

    const messages = await Message.find({ conversation: req.params.conversationId })
      .populate('sender', 'name profileImage')
      .sort({ createdAt: 1 });

    res.json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Send a message (creates a conversation if it doesn't exist)
// @route   POST /api/chat/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  const { receiverId, text, conversationId } = req.body;

  try {
    let conversation;

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    } else if (receiverId) {
      // Find or create conversation between sender and receiver
      conversation = await Conversation.findOne({
        participants: { $all: [req.user.id, receiverId] }
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [req.user.id, receiverId]
        });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Please specify conversationId or receiverId' });
    }

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user.id,
      text
    });

    conversation.lastMessage = text;
    await conversation.save();

    const populatedMessage = await message.populate('sender', 'name profileImage');

    res.status(201).json({ success: true, data: populatedMessage });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
