const svc = require('../services/Pet.Service');

const shape = (p) => ({
  _id: p._id,
  name: p.name,
  type: p.type,
  mood: p.mood,
  hunger: p.hunger,
  thirst: p.thirst,
  emotion: svc.moodToEmotion(p.mood),
  lastFedAt: p.lastFedAt,
  lastDrankAt: p.lastDrankAt,
  lastPlayedAt: p.lastPlayedAt
});

// We can't change server.js, so emit a GLOBAL event; frontend filters by petId.
function broadcast(req, payload) {
  const io = req.app.get('io');
  if (io) io.emit('pet:update', payload);
}

const getOne = async (req, res) => {
  const p = await svc.getPet(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(shape(p));
};

const create = async (req, res) => {
  const p = await svc.createPet(req.body || {});
  res.status(201).json(shape(p));
};

const feed = async (req, res) => {
  try {
    const p = await svc.feedPet(req.params.id);
    const payload = { petId: req.params.id, ...shape(p) };
    broadcast(req, payload);
    res.json(payload);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

const drink = async (req, res) => {
  try {
    const p = await svc.drinkPet(req.params.id);
    const payload = { petId: req.params.id, ...shape(p) };
    broadcast(req, payload);
    res.json(payload);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

const play = async (req, res) => {
  try {
    const p = await svc.playWithPet(req.params.id);
    const payload = { petId: req.params.id, ...shape(p) };
    broadcast(req, payload);
    res.json(payload);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

module.exports = { getOne, create, feed, drink, play };
