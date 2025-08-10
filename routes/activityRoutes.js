const router = require('express').Router();
const activityController = require('../controllers/activityController');

// add your activity routes here

// GET /api/activities?petId=...
router.get('/', activityController.listByPet);

// POST /api/activities
router.post('/', activityController.add);

// endpoints for activity routes

module.exports = router;