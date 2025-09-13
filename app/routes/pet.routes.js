const r = require('express').Router();
const c = require('../controllers/PetController');

r.post('/', c.create);       // POST /api/pet
r.get('/:id', c.getOne);     // GET  /api/pet/:id
r.post('/:id/feed',  c.feed);
r.post('/:id/drink', c.drink);
r.post('/:id/play',  c.play);

module.exports = r;

