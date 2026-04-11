const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe, refreshToken, updateProfile, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.post('/refresh', refreshToken);
router.put('/profile', protect, updateProfile);
router.post('/logout', protect, logout);

module.exports = router;
