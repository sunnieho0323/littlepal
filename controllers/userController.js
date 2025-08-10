// controllers/userController.js
const userService = require('../services/userService');

// list users
exports.getAllUsers = (req, res) => {     // <-- fixed name
  const users = userService.getAllUsers();
  res.json(users);
};

// create user
exports.createUser = (req, res) => {
  const newUser = userService.createUser(req.body);
  res.status(201).json(newUser);
};

// get user by ID
exports.getUserById = (req, res, next) => {
  try {
    const user = userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (e) { next(e); }
};

// update user
exports.updateUser = (req, res, next) => {
  try {
    const updated = userService.updateUser(req.params.id, req.body);
    res.json(updated);
  } catch (e) { next(e); }
};

// delete user
exports.deleteUser = (req, res, next) => {
  try {
    userService.deleteUser(req.params.id);
    res.status(204).end();
  } catch (e) { next(e); }
};
