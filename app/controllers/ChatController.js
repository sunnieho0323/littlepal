// app/controllers/ChatController.js
const ChatService = require('../services/ChatService');

exports.sendMessage = async (req, res, next) => {
  try {
    // For now, use a demo user ID since we don't have auth middleware yet
    const userId = req.user?.id || 'demo_user';
    console.log('📨 B1 - Chat API: Received message:', req.body.message);
    const result = await ChatService.sendMessage(userId, req.body);
    console.log('✅ B1 - Chat API: Message processed successfully');
    res.json({ ok: true, result });
  } catch (err) {
    console.error('❌ B1 - Chat API: Error processing message:', err.message);
    next(err);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    // For now, use a demo user ID since we don't have auth middleware yet
    const userId = req.user?.id || 'demo_user';
    console.log('📜 B2 - Chat History API: Fetching messages for user:', userId);
    const messages = await ChatService.getMessages(userId);
    console.log(`✅ B2 - Chat History API: Retrieved ${messages.length} messages`);
    res.json({ ok: true, messages });
  } catch (err) {
    console.error('❌ B2 - Chat History API: Error fetching messages:', err.message);
    next(err);
  }
};

exports.clearChat = async (req, res, next) => {
  try {
    // For now, use a demo user ID since we don't have auth middleware yet
    const userId = req.user?.id || 'demo_user';
    await ChatService.clearChat(userId);
    res.json({ ok: true, message: 'Chat cleared successfully' });
  } catch (err) {
    next(err);
  }
};
