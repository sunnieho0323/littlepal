// app/routes/memos.routes.js
const express = require('express');
const router = express.Router();
const MemoController = require('../controllers/MemoController');
const { requireAuth } = require('../utils/auth');

router.use(requireAuth);

router.post('/claim-all', MemoController.claimAll);
router.delete('/delete-read', MemoController.deleteRead);

router.post('/', MemoController.create);
router.get('/', MemoController.list);
router.patch('/:id', MemoController.update);
router.get('/:id', MemoController.getById);           
router.post('/:id/claim', MemoController.claim);
router.post('/send', MemoController.send);
router.delete('/:id', MemoController.remove);


module.exports = router;
