const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const AttachmentSchema = new Schema({
  type: { type: String, required: true }, // e.g. 'coins', 'item'
  qty: { type: Number, default: 1, min: 1 },
  claimed: { type: Boolean, default: false },
  claimedAt: { type: Date, default: null },
}, { _id: false });

const MemoSchema = new Schema({
  userId: { type: Types.ObjectId, required: true, index: true }, // 收件人
  subject: { type: String, required: true, trim: true },
  body: { type: String, default: '' },
  label: { type: String, default: 'inbox', index: true }, // inbox/system/gift...
  unread: { type: Boolean, default: true, index: true },
  attachments: { type: AttachmentSchema, default: null },
  expiresAt: { type: Date, default: null, index: true }, // null 表示不會過期
  deletedAt: { type: Date, default: null }, // 之後 Sprint 2 用
}, { timestamps: true });

/** 到期判定（null 代表不會到期） */
MemoSchema.statics.isExpired = (memo) =>
  !!memo.expiresAt && memo.expiresAt.getTime() <= Date.now();

MemoSchema.index({ userId: 1, unread: 1, createdAt: -1 });
MemoSchema.index({ userId: 1, label: 1, createdAt: -1 });
MemoSchema.index({ userId: 1, subject: 1 });

module.exports = mongoose.model('Memo', MemoSchema);
