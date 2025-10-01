// app/controllers/AuthController.js
// 简单版：使用 MongoDB 存储明文密码（课堂演示，勿用于生产）
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

    const user = await User.create({ email, password }); // ⚠️ 明文保存，仅作演示
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

    // 明文比对（演示用）
    const user = await User.findOne({ email: email.toLowerCase(), password }).lean();
    if (!user) {
      return res.status(401).json({ ok: false, message: 'Invalid email or password.' });
    }

    // 简化：不发 JWT，前端用 localStorage 记录邮箱即可
    return res.json({ ok: true, message: 'Logged in', user: { email: user.email, _id: user._id, role: user.role || 'user' } });
  } catch (err) { next(err); }
};

exports.me = async (req, res, next) => {
  try {
    // 如果未来加鉴权中间件，这里返回真实用户。
    return res.json({ ok: true, user: null });
  } catch (err) { next(err); }
};

exports.searchUsers = async (req, res, next) => {
  try {
    const q = String(req.query.search || '').trim().toLowerCase();
    if (!q) return res.json({ data: [] });

    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const list = await User.find(
      { email: rx },
      { _id: 1, email: 1 }
    ).sort({ email: 1 }).limit(8).lean();

    return res.json({ data: list });
  } catch (err) { next(err); }
};

