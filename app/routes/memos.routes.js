// app/routes/memos.routes.js
const { Types: { ObjectId } } = require('mongoose');
const express = require('express');
const router = express.Router();
const MemoController = require('../controllers/MemoController');

router.use((req, res, next) => {
  const id = req.header('x-user-id');
  if (!id || !ObjectId.isValid(id)) {
    return res.status(401).json({ code: 'UNAUTHENTICATED', message: 'x-user-id missing or invalid' });
  }
  req.user = {
    id: new ObjectId(id),
    role: req.header('x-user-role') || 'user',
    email: req.header('x-user-email') || ''
  };
  next();
});

//router.use(pickAuth);

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
