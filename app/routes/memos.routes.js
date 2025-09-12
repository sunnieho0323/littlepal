const express = require('express');
const router = express.Router();
const MemoController = require('../controllers/MemoController');
const { requireAuth } = require('../utils/auth');

router.use(requireAuth);

router.post('/', MemoController.create);
router.get('/', MemoController.list);
router.get('/:id', MemoController.getById);           // 自動 unread->read
router.post('/:id/claim', MemoController.claim);      // 一次性領取

module.exports = router;


