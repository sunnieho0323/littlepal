// controllers/activityController.js
// fake data
const activities = [
  { id: 'a1', petId: 'p1', action: 'feed', note: 'Fed in the morning', createdAt: '2025-08-10T10:00:00Z' }
];

exports.listByPet = (req, res) => {
  const { petId } = req.query;
  const filtered = petId ? activities.filter(a => a.petId === petId) : activities;
  res.json({ status: 'success', data: filtered, message: '' });
};

exports.add = (req, res) => {
  const newActivity = { id: `a${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
  activities.push(newActivity);
  res.status(201).json({ status: 'success', data: newActivity, message: 'Activity added' });
};
