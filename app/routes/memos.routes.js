// app/routes/memos.routes.js
const { Types: { ObjectId } } = require('mongoose');
const express = require('express');
const router = express.Router();
const MemoController = require('../controllers/MemoController');
//const User = require('../models/User');

// Load demo user from .env
const DEMO_ID = process.env.DEMO_USER_ID;
const DEMO_EMAIL = process.env.DEMO_EMAIL;
const DEMO_ROLE = process.env.DEMO_ROLE || 'user';

router.use(async (req, res, next) => {
  let id = req.header('x-user-id');
  let role = req.header('x-user-role');
  let email = req.header('x-user-email');

  try {
    const userCount = await User.estimatedDocumentCount();
    if ((!id || !ObjectId.isValid(id)) && userCount === 0) {
      id = DEMO_ID;
      role = DEMO_ROLE;
      email = DEMO_EMAIL;
    }
  } catch (err) {
    console.error('User count check failed, using demo fallback:', err);
    id = DEMO_ID;
    role = DEMO_ROLE;
    email = DEMO_EMAIL;
  }

  if (!id || !ObjectId.isValid(id)) {
    return res.status(401).json({ code: 'UNAUTHENTICATED', message: 'x-user-id missing or invalid' });
  }

  req.user = {
    id: new ObjectId(id),
    role: role || 'user',
    email: email || '',
  };
  next();
}); 

/*
//Not allow demo user login
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
*/


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
