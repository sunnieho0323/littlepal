const activityService = require('../services/activityService');

// GET /api/activities?petId=xxx
exports.listByPet = (req, res) => {
  const { petId } = req.query;
  const items = activityService.listByPet(petId);
  res.json({ status: 'success', data: { items }, message: '' });
};

// POST /api/activities
exports.add = (req, res) => {
  const { userId, petId, action, note } = req.body || {};
  const activity = activityService.add({ userId, petId, action, note });
  res.status(201).json({ status: 'success', data: { activity }, message: 'Activity added' });
};
