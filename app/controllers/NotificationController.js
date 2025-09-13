// app/controllers/NotificationController.js
const { listSince } = require('../services/NotificationService');

module.exports = {
  async list(req, res) {
    const userId = req.user.id;
    const since = req.query.since;
    const items = await listSince(userId, since);
    return res.json({ data: items });
  },
};
