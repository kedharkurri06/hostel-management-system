const Notice = require('../models/Notice');
const { validateRequired, validateEnum, isValidObjectId } = require('../validators');
const { isDBConnected } = require('../config/db');
const { initialNotices } = require('../utils/fallbackData');

// In-memory array for fallback when DB is offline
let fallbackNotices = [...initialNotices];

// GET /api/notices
const getNotices = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.json({ success: true, data: fallbackNotices, source: 'fallback' });
    }

    const notices = await Notice.find().sort({ createdAt: -1 });
    if (!notices.length) {
      return res.json({ success: true, data: fallbackNotices, source: 'fallback' });
    }

    res.json({ success: true, data: notices });
  } catch (error) {
    res.json({ success: true, data: fallbackNotices, source: 'fallback' });
  }
};

// POST /api/notices
const createNotice = async (req, res, next) => {
  try {
    const missing = validateRequired(['title', 'category', 'content'], req.body);
    if (missing.length) {
      return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` });
    }

    const catError = validateEnum(req.body.category, ['Maintenance', 'Mess & Food', 'HVAC', 'Security', 'General'], 'Category');
    if (catError) return res.status(400).json({ success: false, message: catError });

    if (req.body.priority) {
      const prioError = validateEnum(req.body.priority, ['Normal', 'High'], 'Priority');
      if (prioError) return res.status(400).json({ success: false, message: prioError });
    }

    const formattedDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    if (!isDBConnected()) {
      const newNotice = {
        _id: `n_${Date.now()}`,
        title: req.body.title,
        category: req.body.category,
        priority: req.body.priority || 'Normal',
        content: req.body.content,
        date: req.body.date || formattedDate
      };
      fallbackNotices.unshift(newNotice);
      return res.status(201).json({ success: true, data: newNotice, source: 'fallback' });
    }

    const notice = await Notice.create({
      title: req.body.title,
      category: req.body.category,
      priority: req.body.priority || 'Normal',
      content: req.body.content,
      date: req.body.date || formattedDate,
      author: req.user ? req.user._id : undefined
    });

    res.status(201).json({ success: true, data: notice });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/notices/:id
const updateNotice = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      fallbackNotices = fallbackNotices.map(n => n._id === req.params.id ? { ...n, ...req.body } : n);
      return res.json({ success: true, message: 'Notice updated' });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid notice ID' });
    }

    const updated = await Notice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/notices/:id
const deleteNotice = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      fallbackNotices = fallbackNotices.filter(n => n._id !== req.params.id);
      return res.json({ success: true, message: 'Notice deleted successfully' });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid notice ID' });
    }

    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotices, createNotice, updateNotice, deleteNotice };
