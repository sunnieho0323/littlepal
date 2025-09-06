// app/routes/pet.routes.js
const r = require('express').Router();
const C = require('../controllers/PetController');
r.get('/state', C.getState);
r.post('/feed', C.feed);
r.post('/play', C.play);
module.exports = r;
