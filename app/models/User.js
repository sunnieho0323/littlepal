// app/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true }, // ⚠️ 课堂演示：明文存储。真实项目需加密。
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
