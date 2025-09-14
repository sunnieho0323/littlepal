// app/routes/chat.routes.js
const router = require('express').Router();
const C = require('../controllers/ChatController');

router.post('/send', C.sendMessage);
router.get('/messages', C.getMessages);
router.delete('/clear', C.clearChat);

module.exports = router;
