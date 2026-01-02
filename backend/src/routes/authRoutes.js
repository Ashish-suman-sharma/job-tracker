const express = require('express');
const router = express.Router();
const { register, login, getProfile, linkTelegram } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.post('/link-telegram', protect, linkTelegram);

module.exports = router;
