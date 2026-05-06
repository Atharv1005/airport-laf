const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);
router.get('/user/:id', protect, authController.getUserById);

// Admin routes
router.get('/pending-users', protect, adminOnly, authController.getPendingUsers);
router.patch('/approve-user/:id', protect, adminOnly, authController.approveUser);
router.get('/all-users', protect, adminOnly, authController.getAllUsers);

module.exports = router;
