const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const { requireAuth } = require('../utils/auth');

router.use(requireAuth);
router.get('/', NotificationController.list);

module.exports = router;
