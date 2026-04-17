const express = require('express');
const router = express.Router();
const { signup, login, verifyOTP, resendOTP } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/verify', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);

module.exports = router;