const Notification = require('../../models/Notification');

async function createNotification(userId, type, payload = {}) {
  return Notification.create({ userId, type, payload });
}

async function listSince(userId, since) {
  const sinceDate = since ? new Date(since) : new Date(0);
  return Notification.find({
    userId,
    createdAt: { $gt: sinceDate },
  }).sort({ createdAt: 1 }).lean();
}

module.exports = { createNotification, listSince };
