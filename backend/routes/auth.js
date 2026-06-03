const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, updatePassword, updateMe, updateAvatar } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['customer', 'agency']).withMessage('Role must be customer or agency'),
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
], login);

router.get('/me',              protect, getMe);
router.put('/updatepassword',  protect, updatePassword);
router.put('/updateme',        protect, updateMe);
router.put('/avatar',          protect, updateAvatar);

module.exports = router;
