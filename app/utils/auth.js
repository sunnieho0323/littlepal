// app/utils/auth.js
const mongoose = require('mongoose');

function requireAuth(req, res, next) {
  const headerId = req.header('x-user-id');

    if (process.env.NODE_ENV === 'production' && !headerId) {
    return res.status(401).json({ code: 'UNAUTHENTICATED', message: 'Auth required' });
  }
  
  const envId = process.env.DEMO_USER_ID; 
  
  const id = headerId || envId;

  if (!id || !mongoose.isValidObjectId(id)) {
    return res.status(401).json({
      code: 'UNAUTHENTICATED',
      message: 'x-user-id missing or invalid'
    });
  }

  req.user = { id: new mongoose.Types.ObjectId(id) };
  next();
}

module.exports = { requireAuth };
