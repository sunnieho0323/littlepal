// Fake DB (in-memory)
let activities = [
  { id: 'a1', userId: 'u1', petId: 'p1', action: 'feed', note: 'Fed AM', createdAt: '2025-08-10T10:00:00Z' }
];

// Create
const add = ({ userId, petId, action, note }) => {
  const item = {
    id: `a${Date.now()}`,
    userId,
    petId,
    action,
    note: note || '',
    createdAt: new Date().toISOString()
  };
  activities.push(item);
  return item;
};

// Read (by pet)
const listByPet = (petId) => {
  if (!petId) return activities;
  return activities.filter(a => a.petId === petId);
};

// (Optional) reset for tests
const _reset = (seed = []) => { activities = seed; };

module.exports = { add, listByPet, _reset };
