const PetService = require('../services/Pet.Service');

exports.getMine = async (req, res) => {
  try {
    const ownerId = req.params.ownerId;
    const pet = await PetService.getByOwner(ownerId);
    if (!pet) return res.status(404).json({ message: 'No pet for this user.' });
    res.json(pet);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const petId = req.params.id;
    const pet = await require('../../models/Pet').findById(petId);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    res.json(pet);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { ownerId, name, type } = req.body;
    if (!ownerId || !name) {
      return res.status(400).json({ error: 'ownerId and name are required' });
    }
    const pet = await PetService.createPet({ ownerId, name, type });
    const io = req.app.get('io');
    io?.to(`room:${ownerId}`).emit('pet:update', pet);
    res.status(201).json(pet);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const ownerId = req.params.ownerId;
    const pet = await PetService.deletePet(ownerId);
    if (!pet) return res.status(404).json({ message: 'No pet to delete.' });
    const io = req.app.get('io');
    io?.to(`room:${ownerId}`).emit('pet:released', { ownerId, petId: pet._id });
    res.json({ message: 'Pet released successfully.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.feed = async (req, res) => {
  try {
    const pet = await PetService.feedPet(req.params.id);
    res.json(pet);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.drink = async (req, res) => {
  try {
    const pet = await PetService.drinkPet(req.params.id);
    res.json(pet);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.play = async (req, res) => {
  try {
    const pet = await PetService.playWithPet(req.params.id);
    res.json(pet);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
