// app/services/pet.service.js
const Pet = require('../../models/Pet');

// simple cooldown map to avoid spamming actions
const lastAction = new Map();
const COOLDOWN_MS = 3000;

const clamp = (v) => Math.max(0, Math.min(100, v));
const gate = (key) => {
  const now = Date.now();
  const prev = lastAction.get(key) || 0;
  if (now - prev < COOLDOWN_MS) return false;
  lastAction.set(key, now);
  return true;
};

// translate mood number into an emotion string for the heart
function moodToEmotion(mood) {
  if (mood >= 70) return 'happy';
  if (mood >= 40) return 'neutral';
  return 'sad';
}

// CRUD + actions
async function getPet(id) {
  return Pet.findById(id);
}

async function createPet(data) {
  if (!data.ownerId) data.ownerId = 'demo-user'; // fallback if no auth yet
  return Pet.create(data);
}

async function feedPet(id) {
  if (!gate(`${id}:feed`)) throw new Error('Too soon to feed');
  const p = await Pet.findById(id);
  if (!p) throw new Error('Pet not found');
  p.hunger = clamp(p.hunger - 15);
  p.mood = clamp(p.mood + 5);
  p.lastFedAt = new Date();
  await p.save();
  return p;
}

async function drinkPet(id) {
  if (!gate(`${id}:drink`)) throw new Error('Too soon to drink');
  const p = await Pet.findById(id);
  if (!p) throw new Error('Pet not found');
  p.thirst = clamp(p.thirst - 20);
  p.mood = clamp(p.mood + 4);
  p.lastDrankAt = new Date();
  await p.save();
  return p;
}

async function playWithPet(id) {
  if (!gate(`${id}:play`)) throw new Error('Too soon to play');
  const p = await Pet.findById(id);
  if (!p) throw new Error('Pet not found');
  p.mood = clamp(p.mood + 12);
  p.hunger = clamp(p.hunger + 3);
  p.thirst = clamp(p.thirst + 5);
  p.lastPlayedAt = new Date();
  await p.save();
  return p;
}

module.exports = {
  getPet,
  createPet,
  feedPet,
  drinkPet,
  playWithPet,
  moodToEmotion
};
