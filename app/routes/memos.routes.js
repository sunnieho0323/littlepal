// app/routes/memos.routes.js
const express = require('express');
const router = express.Router();
const MemoController = require('../controllers/MemoController');
//const { requireAuth } = require('../utils/auth');

// --- dev-only mock user (only for /api/memos/*) ---
const devMemoMockUser = (req, _res, next) => {
  if (!req.user) {
    req.user = {
      id: process.env.DEMO_USER_ID,
      role: process.env.DEMO_ROLE,
      email: process.env.DEMO_EMAIL,
    };
  }
  next();
};

router.use((req, res, next) => {
  if (process.env.USE_MEMO_DEV === '1') {
    devMemoMockUser(req, res, next);
  } else {
    requireAuth(req, res, next);
  }
});

//router.use(requireAuth);

router.post('/claim-all', MemoController.claimAll);
router.delete('/delete-read', MemoController.deleteRead);

router.get('/', MemoController.list);
router.post('/', MemoController.create);
router.get('/:id', MemoController.getById);
router.patch('/:id', MemoController.update);
router.delete('/:id', MemoController.remove);
router.post('/:id/claim', MemoController.claim);
router.post('/send', MemoController.send);

module.exports = router;
