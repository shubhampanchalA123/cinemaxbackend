const jwt = require('jsonwebtoken');
const User = require('../models/User');
const generateOTP = require('../utils/otpGenerator');
const sendOTP = require('../services/emailService');

const signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ email, password, isVerified: false });
    await user.save();

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    await sendOTP(email, otp).catch(err => console.log('Email error:', err.message));

    // Dev mode: return OTP in response
    res.status(201).json({ 
      message: 'OTP sent to email. Please verify your account.',
      userId: user._id,
      otp: otp // Remove in production
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    
    if (!userId || !otp) {
      return res.status(400).json({ message: 'User ID and OTP are required' });
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account already verified' });
    }

    if (String(user.otp) !== String(otp) || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ 
      message: 'Account verified successfully!',
      token, 
      user: { id: user._id, email: user.email, isVerified: user.isVerified } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account already verified' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendOTP(email, otp);

    res.json({ message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ 
        message: 'Account not verified. Please verify your account first.',
        userId: user._id
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user._id, email: user.email, isVerified: user.isVerified } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { signup, login, verifyOTP, resendOTP };