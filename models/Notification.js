const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const NotificationSchema = new Schema({
  userId: { type: Types.ObjectId, required: true, index: true },
  type: { type: String, required: true }, // e.g. 'memo.created', 'memo.restored'
  payload: { type: Object, default: {} }, // { memoId }
}, { timestamps: true });

NotificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
