const mongoose = require('mongoose');

function requireAuth(req, _res, next) {
  const headerId = req.header('x-user-id');
  const envId = process.env.DEMO_USER_ID || '64c7dd7aa0a0000000000001';
  const id = headerId || envId;

  // 統一用 ObjectId
  req.user = { id: new mongoose.Types.ObjectId(id) };
  next();
}

module.exports = { requireAuth };
