// app/utils/auth.js
const mongoose = require('mongoose');

function requireAuth(req, _res, next) {
  const headerId = req.header('x-user-id');
  const envId = process.env.DEMO_USER_ID //|| '64c7dd7aa0a0000000000001'; 
  //receipent: window.DEMO_USER_ID = '00000000000000000000b00b';
  
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
