// app/routes/auth.routes.js
const router = require('express').Router();
const C = require('../controllers/AuthController');

// Each handler MUST be a function, not undefined
router.post('/register', C.register);
router.post('/login', C.login);
router.get('/me', C.me);

module.exports = router;
