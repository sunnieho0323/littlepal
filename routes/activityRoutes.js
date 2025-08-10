const express = require('express');
const router = express.Router();

// add your activity routes here

// GET /api/activities?petId=...
router.get('/', activityController.listByPet);

// POST /api/activities
router.post('/', activityController.add);

// endpoints for activity routes

module.exports = router;