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
    const { name, email, password, studentId } = req.body;

    const missing = validateRequired(['name', 'password'], req.body);
    if (missing.length) {
      return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const query = [];
    if (studentId) query.push({ studentId: String(studentId).trim().toUpperCase() });
    if (email) query.push({ email: email.trim().toLowerCase() });

    if (query.length > 0) {
      const existingUser = await User.findOne({ $or: query });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Account with this ID or Email already exists' });
      }
    }

    const userData = {
      name: name.trim(),
      password,
      role: 'student'
    };
    if (studentId) userData.studentId = String(studentId).trim().toUpperCase();
    if (email) userData.email = email.trim().toLowerCase();

    const user = await User.create(userData);
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          studentId: user.studentId,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role
        },
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
    const rawIdentifier = req.body.identifier || req.body.username || req.body.studentId || req.body.email;
    const { password } = req.body;

    if (!rawIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both Student ID / Username and Password'
      });
    }

    const identifier = String(rawIdentifier).trim();

    // Query user by studentId, username, or email
    const user = await User.findOne({
      $or: [
        { studentId: identifier.toUpperCase() },
        { studentId: identifier },
        { username: identifier.toLowerCase() },
        { email: identifier.toLowerCase() }
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your ID/username and password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your ID/username and password.'
      });
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          studentId: user.studentId,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        _id: req.user._id,
        studentId: req.user.studentId,
        username: req.user.username,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    }
  });
};

module.exports = { register, login, getMe };
