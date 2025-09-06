// app/controllers/PetController.js
const PetService = require('../services/PetService');

exports.getState = async (req, res, next) => {
  try {
    const state = await PetService.getState(req.user?.id);
    res.json({ ok: true, state });
  } catch (err) {
    next(err);
  }
};

exports.feed = async (req, res, next) => {
  try {
    const result = await PetService.feed(req.user?.id);
    res.json({ ok: true, result });
  } catch (err) {
    next(err);
  }
};

exports.play = async (req, res, next) => {
  try {
    const result = await PetService.play(req.user?.id);
    res.json({ ok: true, result });
  } catch (err) {
    next(err);
  }
};
