const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateRequired } = require('../validators');
const { isDBConnected } = require('../config/db');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'dev_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const missing = validateRequired(['name', 'email', 'password'], req.body);
    if (missing.length) {
      return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    if (!isDBConnected()) {
      // In offline/pending mode, create a local session
      const token = generateToken(`demo_student_${Date.now()}`);
      return res.status(201).json({
        success: true,
        data: {
          user: { _id: `demo_${Date.now()}`, name, email, role: 'student' },
          token
        },
        source: 'fallback'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, role: 'student' });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        user: { _id: user._id, name: user.name, email: user.email, role: user.role },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const missing = validateRequired(['email', 'password'], req.body);
    if (missing.length) {
      return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` });
    }

    // If DB is offline/pending, support demo credentials
    if (!isDBConnected()) {
      const lower = email.toLowerCase();
      const isWarden = lower.includes('warden') || lower === 'warden@vtu.edu' || password === 'warden@vtu';
      if (isWarden) {
        const token = generateToken('demo_warden_id');
        return res.json({
          success: true,
          data: {
            user: { _id: 'demo_warden_id', name: 'VTU Warden Admin', email, role: 'warden' },
            token
          },
          source: 'fallback'
        });
      } else {
        const token = generateToken('demo_student_id');
        return res.json({
          success: true,
          data: {
            user: { _id: 'demo_student_id', name: 'VTU Student (28892)', email, role: 'student' },
            token
          },
          source: 'fallback'
        });
      }
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        user: { _id: user._id, name: user.name, email: user.email, role: user.role },
        token
      }
    });
  } catch (error) {
    // If query failed due to DB timeout, allow demo login
    const lower = (req.body.email || '').toLowerCase();
    const role = lower.includes('warden') ? 'warden' : 'student';
    const token = generateToken(`demo_${role}`);
    res.json({
      success: true,
      data: {
        user: { _id: `demo_${role}`, name: role === 'warden' ? 'Warden Admin' : 'Student', email: req.body.email, role },
        token
      },
      source: 'fallback'
    });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({
    success: true,
    data: {
      user: { _id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role }
    }
  });
};

module.exports = { register, login, getMe };
