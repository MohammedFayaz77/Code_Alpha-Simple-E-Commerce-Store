const express = require('express');
const { register, login, getMe, updateProfile, getAllUsers } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.get('/users', authenticate, getAllUsers);

module.exports = router;
