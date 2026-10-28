const Notice = require('../models/Notice');
const { validateRequired, validateEnum, isValidObjectId } = require('../validators');
const { isDBConnected } = require('../config/db');

// In-memory array for fallback when DB is offline (default empty, zero mock data)
let fallbackNotices = [];

const MOCK_TITLES = [
  'Scheduled Water Tank Cleaning & Pipe Maintenance',
  'Mess Menu Special Request Drive & Survey',
  'AC Filter Servicing Drive - Block A & B'
];

// GET /api/notices
const getNotices = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.json({ success: true, data: fallbackNotices, source: 'fallback' });
    }

    // Automatically purge legacy mock notices if they exist in MongoDB
    await Notice.deleteMany({
      $or: [
        { title: { $in: MOCK_TITLES } },
        { _id: { $in: ['n1', 'n2', 'n3'] } }
      ]
    }).catch(() => {});

    const notices = await Notice.find().sort({ createdAt: -1 });
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
        title: req.body.title.trim(),
        category: req.body.category,
        priority: req.body.priority || 'Normal',
        content: req.body.content.trim(),
        date: req.body.date || formattedDate
      };
      fallbackNotices.unshift(newNotice);
      return res.status(201).json({ success: true, data: newNotice, source: 'fallback' });
    }

    const notice = await Notice.create({
      title: req.body.title.trim(),
      category: req.body.category,
      priority: req.body.priority || 'Normal',
      content: req.body.content.trim(),
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
    const id = req.params.id;

    if (!isDBConnected()) {
      fallbackNotices = fallbackNotices.map(n => n._id === id ? { ...n, ...req.body } : n);
      return res.json({ success: true, message: 'Notice updated' });
    }

    const query = isValidObjectId(id) ? { _id: id } : { _id: id };
    let updated;
    if (isValidObjectId(id)) {
      updated = await Notice.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    } else {
      updated = await Notice.findOneAndUpdate({ $or: [{ _id: id }, { title: id }] }, req.body, { new: true, runValidators: true });
    }

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
    const id = req.params.id;

    // Filter from fallback in-memory list
    fallbackNotices = fallbackNotices.filter(n => n._id !== id && n.id !== id);

    if (!isDBConnected()) {
      return res.json({ success: true, message: 'Notice deleted successfully' });
    }

    if (isValidObjectId(id)) {
      await Notice.findByIdAndDelete(id);
    } else {
      // Support deleting by custom ID, mock ID, or title
      await Notice.findOneAndDelete({
        $or: [{ _id: id }, { title: id }]
      });
    }

    res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotices, createNotice, updateNotice, deleteNotice };
