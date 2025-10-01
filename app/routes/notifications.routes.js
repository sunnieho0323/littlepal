// app/routes/notifications.routes.js
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');

// --- auth middleware (demo only, per-route) ---
function pickAuth(req, res, next) {
  const id = req.header('x-user-id') || process.env.DEMO_USER_ID;
  if (!id || !mongoose.isValidObjectId(id)) {
    return res.status(401).json({ code: 'UNAUTHENTICATED', message: 'x-user-id missing or invalid' });
  }
  req.user = {
    id: new mongoose.Types.ObjectId(id),
    role: (req.header('x-user-role') || process.env.DEMO_ROLE || 'user').toLowerCase(),
    email: req.header('x-user-email') || process.env.DEMO_EMAIL || undefined,
  };
  next();
}

router.use(pickAuth);
router.get('/', NotificationController.list);

module.exports = router;
