const Message = require('../models/Message');
const Project = require('../models/Project');
const User = require('../models/User');

// Send a new message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, projectId, content } = req.body;
    const senderId = req.user._id;

    if (!receiverId || !projectId || !content) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      project: projectId,
      content
    });

    await message.save();

    // Populate sender info for the real-time response
    const populatedMessage = await Message.findById(message._id).populate('sender', 'fullName avatarUrl');

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get conversations (grouping messages by project and the other user)
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
    .sort({ createdAt: -1 })
    .populate('sender', 'fullName')
    .populate('receiver', 'fullName')
    .populate('project', 'title');

    // Group into conversations map
    // Key: projectId_otherUserId
    const conversationsMap = new Map();

    messages.forEach(msg => {
      const isSender = msg.sender._id.toString() === userId.toString();
      const otherUser = isSender ? msg.receiver : msg.sender;
      
      if (!otherUser || !msg.project) return; // Skip corrupted data

      const key = `${msg.project._id}_${otherUser._id}`;
      
      if (!conversationsMap.has(key)) {
        conversationsMap.set(key, {
          projectId: msg.project._id,
          projectTitle: msg.project.title,
          otherUserId: otherUser._id,
          otherUserName: otherUser.fullName,
          latestMessage: msg.content,
          latestMessageDate: msg.createdAt,
          unreadCount: (!isSender && !msg.read) ? 1 : 0
        });
      } else {
        if (!isSender && !msg.read) {
          const conv = conversationsMap.get(key);
          conv.unreadCount += 1;
        }
      }
    });

    const conversations = Array.from(conversationsMap.values());
    res.status(200).json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get messages for a specific conversation
exports.getConversationMessages = async (req, res) => {
  try {
    const { projectId, otherUserId } = req.params;
    const userId = req.user._id;

    const messages = await Message.find({
      project: projectId,
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'fullName');

    // Mark as read
    await Message.updateMany(
      { project: projectId, sender: otherUserId, receiver: userId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
