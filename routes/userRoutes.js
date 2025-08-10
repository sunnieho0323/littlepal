const express = require('express');
const router = express.Router();

// add your user routes here
const userController = require('../controllers/userController');

// endpoints for user routes
router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;