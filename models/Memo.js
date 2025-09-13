// models/Memo.js
const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const AttachmentSchema = new Schema({
  type: { type: String, required: true },          // 'currency' | 'item' | ...
  payload: { type: Schema.Types.Mixed, default: {} }, // {gold:100} 
  claimed: { type: Boolean, default: false },
  claimedAt: { type: Date, default: null },
}, { _id: false });

const MemoSchema = new Schema({
  userId: { type: Types.ObjectId, required: true, index: true },
  subject: { type: String, required: true, trim: true },
  body: { type: String, default: '' },
  label: { type: String, default: 'inbox', index: true },
  unread: { type: Boolean, default: true, index: true },
  attachments: { type: [AttachmentSchema], default: [] },
  expiresAt: { type: Date, default: null, index: true },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

MemoSchema.statics.isExpired = (memo) =>
  !!memo.expiresAt && memo.expiresAt.getTime() <= Date.now();

MemoSchema.index({ userId: 1, unread: 1, createdAt: -1 });
MemoSchema.index({ userId: 1, label: 1, createdAt: -1 });
MemoSchema.index({ userId: 1, subject: 1 });

module.exports = mongoose.model('Memo', MemoSchema);
