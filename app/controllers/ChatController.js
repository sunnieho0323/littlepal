// app/controllers/ChatController.js
const ChatService = require('../services/ChatService');

exports.sendMessage = async (req, res, next) => {
  try {
    const result = await ChatService.sendMessage(req.user?.id, req.body);
    res.json({ ok: true, result });
  } catch (err) {
    next(err);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const messages = await ChatService.getMessages(req.user?.id);
    res.json({ ok: true, messages });
  } catch (err) {
    next(err);
  }
};
