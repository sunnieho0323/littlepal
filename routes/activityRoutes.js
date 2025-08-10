const express = require('express');
const router = express.Router();

// add your activity routes here

const Controllers = require('../controllers/activityController');

// POST /api/activities
router.get('/', Controllers.listByPet);
router.post('/', Controllers.add);


module.exports = router;