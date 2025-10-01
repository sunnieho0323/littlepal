// app/controllers/AuthController.js
// 使用 MongoDB 存储明文密码
const User = require('../models/User');

exports.register = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ ok: false, message: 'Email and password are required.' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ ok: false, message: 'Invalid email format.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ ok: false, message: 'Password must be at least 8 characters.' });
    }

    // 是否已注册
    const exists = await User.findOne({ email: email.toLowerCase() }).lean();
    if (exists) {
      return res.status(409).json({ ok: false, message: 'Email already registered.' });
    }

    const user = await User.create({ email, password }); 
    // 简化处理：注册成功即视为登录成功
    return res.status(201).json({ ok: true, message: 'Registered', user: { email: user.email } });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ ok: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase(), password }).lean();
    if (!user) {
      return res.status(401).json({ ok: false, message: 'Invalid email or password.' });
    }


    return res.json({ ok: true, message: 'Logged in', user: { email: user.email } });
  } catch (err) { next(err); }
};

exports.me = async (req, res, next) => {
  try {
  
    return res.json({ ok: true, user: null });
  } catch (err) { next(err); }
};
