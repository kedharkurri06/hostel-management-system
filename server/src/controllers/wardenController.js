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
    const { name, role, block, phone, email, office, hours, avatar, wardenId: customWardenId } = req.body;
    if (!name || !role || !block || !phone || !email) {
      return res.status(400).json({ success: false, message: 'name, role, block, phone, email are required' });
    }

    let wardenId = customWardenId ? customWardenId.trim() : null;

    if (!isDBConnected()) {
      if (!wardenId) wardenId = `W${fallbackWardens.length + 1}`;
      const newWarden = { _id: `wd_${Date.now()}`, wardenId, name, role, block, phone, email, office: office || '', hours: hours || '', avatar: avatar || '' };
      fallbackWardens.push(newWarden);
      return res.status(201).json({ success: true, data: newWarden, source: 'fallback' });
    }

    if (!wardenId) {
      const count = await Warden.countDocuments();
      wardenId = `W${count + 1}`;
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
    const allowedFields = ['wardenId', 'name', 'role', 'block', 'phone', 'email', 'office', 'hours', 'avatar'];
    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (!isDBConnected()) {
      fallbackWardens = fallbackWardens.map(w => (w._id === req.params.id || w.wardenId === req.params.id) ? { ...w, ...updates } : w);
      const updated = fallbackWardens.find(w => w._id === req.params.id || w.wardenId === req.params.id);
      return res.json({ success: true, data: updated, source: 'fallback' });
    }

    const query = isValidObjectId(req.params.id) ? { _id: req.params.id } : { wardenId: req.params.id };
    const updated = await Warden.findOneAndUpdate(query, updates, { new: true, runValidators: true });
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

    const query = isValidObjectId(req.params.id) ? { _id: req.params.id } : { wardenId: req.params.id };
    const warden = await Warden.findOneAndDelete(query);
    if (!warden) return res.status(404).json({ success: false, message: 'Warden not found' });

    res.json({ success: true, message: 'Warden deleted' });
  } catch (error) {
    next(error);
  }
};

// POST /api/wardens/staff
const createStaff = async (req, res, next) => {
  try {
    const { name, designation, phone, availability } = req.body;
    if (!name || !designation || !phone || !availability) {
      return res.status(400).json({ success: false, message: 'name, designation, phone, and availability are required' });
    }

    if (!isDBConnected()) {
      const newStaff = { _id: `st_${Date.now()}`, name: name.trim(), designation: designation.trim(), phone: phone.trim(), availability: availability.trim() };
      fallbackStaff.push(newStaff);
      return res.status(201).json({ success: true, data: newStaff, source: 'fallback' });
    }

    const staffMember = await Staff.create({
      name: name.trim(),
      designation: designation.trim(),
      phone: phone.trim(),
      availability: availability.trim()
    });
    res.status(201).json({ success: true, data: staffMember });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/wardens/staff/:id
const updateStaff = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'designation', 'phone', 'availability'];
    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = typeof req.body[key] === 'string' ? req.body[key].trim() : req.body[key];
    }

    if (!isDBConnected()) {
      fallbackStaff = fallbackStaff.map(s => s._id === req.params.id ? { ...s, ...updates } : s);
      const updated = fallbackStaff.find(s => s._id === req.params.id);
      return res.json({ success: true, data: updated, source: 'fallback' });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid staff ID format' });
    }

    const updated = await Staff.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Technician/Staff member not found' });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/wardens/staff/:id
const deleteStaff = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      fallbackStaff = fallbackStaff.filter(s => s._id !== req.params.id);
      return res.json({ success: true, message: 'Technician/Staff member deleted' });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid staff ID format' });
    }

    const deleted = await Staff.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Technician/Staff member not found' });

    res.json({ success: true, message: 'Technician/Staff member deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWardens,
  createWarden,
  updateWarden,
  deleteWarden,
  createStaff,
  updateStaff,
  deleteStaff
};
