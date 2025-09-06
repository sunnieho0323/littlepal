// app/routes/memos.routes.js
const router = require('express').Router();
const C = require('../controllers/MemoController');

router.get('/', C.list);
router.post('/', C.create);
router.put('/:id', C.update);
router.delete('/:id', C.remove);
router.post('/:id/complete', C.complete);
router.post('/:id/notify', C.notify);

module.exports = router;