const Warden = require('../models/Warden');
const Staff = require('../models/Staff');
const { isDBConnected } = require('../config/db');
const { isValidObjectId } = require('../validators');
const { initialWardens, initialStaff } = require('../utils/fallbackData');

// In-memory fallback
let fallbackWardens = [...initialWardens];
let fallbackStaff = [...initialStaff];

// GET /api/wardens
const getWardens = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.json({ success: true, data: { wardens: fallbackWardens, staff: fallbackStaff }, source: 'fallback' });
    }

    const wardens = await Warden.find().sort({ createdAt: 1 });
    const staff = await Staff.find().sort({ createdAt: 1 });

    if (!wardens.length) {
      return res.json({ success: true, data: { wardens: fallbackWardens, staff: fallbackStaff }, source: 'fallback' });
    }

    res.json({ success: true, data: { wardens, staff } });
  } catch (error) {
    res.json({ success: true, data: { wardens: fallbackWardens, staff: fallbackStaff }, source: 'fallback' });
  }
};

// POST /api/wardens
const createWarden = async (req, res, next) => {
  try {
    const { name, role, block, phone, email, office, hours, avatar } = req.body;
    if (!name || !role || !block || !phone || !email) {
      return res.status(400).json({ success: false, message: 'name, role, block, phone, email are required' });
    }

    const wardenId = `w_${Date.now()}`;

    if (!isDBConnected()) {
      const newWarden = { _id: `wd_${Date.now()}`, wardenId, name, role, block, phone, email, office: office || '', hours: hours || '', avatar: avatar || '' };
      fallbackWardens.push(newWarden);
      return res.status(201).json({ success: true, data: newWarden, source: 'fallback' });
    }

    const warden = await Warden.create({ wardenId, name, role, block, phone, email, office, hours, avatar });
    res.status(201).json({ success: true, data: warden });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/wardens/:id
const updateWarden = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'role', 'block', 'phone', 'email', 'office', 'hours', 'avatar'];
    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (!isDBConnected()) {
      fallbackWardens = fallbackWardens.map(w => (w._id === req.params.id || w.wardenId === req.params.id) ? { ...w, ...updates } : w);
      const updated = fallbackWardens.find(w => w._id === req.params.id || w.wardenId === req.params.id);
      return res.json({ success: true, data: updated, source: 'fallback' });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid warden ID' });
    }

    const updated = await Warden.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Warden not found' });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/wardens/:id
const deleteWarden = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      fallbackWardens = fallbackWardens.filter(w => w._id !== req.params.id && w.wardenId !== req.params.id);
      return res.json({ success: true, message: 'Warden deleted' });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid warden ID' });
    }

    const warden = await Warden.findByIdAndDelete(req.params.id);
    if (!warden) return res.status(404).json({ success: false, message: 'Warden not found' });

    res.json({ success: true, message: 'Warden deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWardens, createWarden, updateWarden, deleteWarden };
