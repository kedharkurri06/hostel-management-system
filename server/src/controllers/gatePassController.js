const GatePass = require('../models/GatePass');
const { validateRequired, validateEnum, isValidObjectId } = require('../validators');
const { isDBConnected } = require('../config/db');

// Fallback in-memory store for offline mode
let fallbackPasses = [
  {
    _id: 'gp_001',
    passId: 'GP-2001',
    studentName: 'Rahul Sharma',
    roomNo: '304',
    block: 'Block A (Boys)',
    phone: '+91 98765 43210',
    purpose: 'Family function at home town',
    destination: 'Bengaluru, Karnataka',
    outDate: '2026-07-29',
    returnDate: '2026-07-31',
    type: 'Weekend Pass',
    status: 'Approved',
    wardenRemarks: 'Approved. Travel safely and return by 9 PM on the return date.',
    createdAt: new Date('2026-07-27T10:00:00').toISOString()
  },
  {
    _id: 'gp_002',
    passId: 'GP-2002',
    studentName: 'Priya Patel',
    roomNo: '501',
    block: 'Block B (Girls)',
    phone: '+91 91234 56789',
    purpose: 'Medical appointment at City Hospital',
    destination: 'City Hospital, MG Road',
    outDate: '2026-07-30',
    returnDate: '2026-07-30',
    type: 'Medical Pass',
    status: 'Pending',
    wardenRemarks: '',
    createdAt: new Date('2026-07-29T14:00:00').toISOString()
  }
];

// Generate unique pass ID
const generatePassId = () => `GP-${Math.floor(1000 + Math.random() * 9000)}`;

// GET /api/gatepasses
const getGatePasses = async (req, res, next) => {
  try {
    const { status, type, search, page = 1, limit = 20 } = req.query;

    if (!isDBConnected()) {
      let result = [...fallbackPasses];
      if (status && status !== 'All') result = result.filter(g => g.status === status);
      if (type && type !== 'All') result = result.filter(g => g.type === type);
      if (search) {
        const q = search.toLowerCase();
        result = result.filter(g =>
          g.passId.toLowerCase().includes(q) ||
          g.studentName.toLowerCase().includes(q) ||
          g.destination.toLowerCase().includes(q)
        );
      }
      return res.json({
        success: true,
        data: result,
        source: 'fallback',
        pagination: { page: 1, limit: parseInt(limit), total: result.length, pages: 1 }
      });
    }

    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (type && type !== 'All') filter.type = type;
    if (search) {
      const q = search.trim();
      filter.$or = [
        { passId: { $regex: q, $options: 'i' } },
        { studentName: { $regex: q, $options: 'i' } },
        { destination: { $regex: q, $options: 'i' } },
        { purpose: { $regex: q, $options: 'i' } }
      ];
    }

    // If student role, only show own passes
    if (req.user && req.user.role === 'student') {
      filter.submittedBy = req.user._id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await GatePass.countDocuments(filter);
    const passes = await GatePass.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('submittedBy', 'name email')
      .populate('reviewedBy', 'name');

    res.json({
      success: true,
      data: passes,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    res.json({
      success: true,
      data: fallbackPasses,
      source: 'fallback',
      pagination: { page: 1, limit: 20, total: fallbackPasses.length, pages: 1 }
    });
  }
};

// GET /api/gatepasses/:id
const getGatePass = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      const found = fallbackPasses.find(g => g._id === req.params.id || g.passId === req.params.id);
      if (!found) return res.status(404).json({ success: false, message: 'Gate pass not found' });
      return res.json({ success: true, data: found, source: 'fallback' });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid gate pass ID' });
    }

    const pass = await GatePass.findById(req.params.id)
      .populate('submittedBy', 'name email')
      .populate('reviewedBy', 'name');
    if (!pass) return res.status(404).json({ success: false, message: 'Gate pass not found' });

    res.json({ success: true, data: pass });
  } catch (error) {
    next(error);
  }
};

// POST /api/gatepasses  (student submits)
const createGatePass = async (req, res, next) => {
  try {
    const missing = validateRequired(['studentName', 'roomNo', 'block', 'phone', 'purpose', 'destination', 'outDate', 'returnDate'], req.body);
    if (missing.length) {
      return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` });
    }

    const blockError = validateEnum(req.body.block, ['Block A (Boys)', 'Block B (Girls)', 'Block C (International)'], 'Block');
    if (blockError) return res.status(400).json({ success: false, message: blockError });

    if (req.body.type) {
      const typeError = validateEnum(req.body.type, ['Day Pass', 'Weekend Pass', 'Emergency Pass', 'Medical Pass', 'Vacation Pass'], 'Type');
      if (typeError) return res.status(400).json({ success: false, message: typeError });
    }

    const passId = generatePassId();

    if (!isDBConnected()) {
      const newPass = {
        _id: `gp_${Date.now()}`,
        passId,
        studentName: req.body.studentName,
        roomNo: req.body.roomNo,
        block: req.body.block,
        phone: req.body.phone,
        purpose: req.body.purpose,
        destination: req.body.destination,
        outDate: req.body.outDate,
        returnDate: req.body.returnDate,
        type: req.body.type || 'Day Pass',
        status: 'Pending',
        wardenRemarks: '',
        createdAt: new Date().toISOString()
      };
      fallbackPasses.unshift(newPass);
      return res.status(201).json({ success: true, data: newPass, source: 'fallback' });
    }

    const pass = await GatePass.create({
      passId,
      studentName: req.body.studentName,
      roomNo: req.body.roomNo,
      block: req.body.block,
      phone: req.body.phone,
      purpose: req.body.purpose,
      destination: req.body.destination,
      outDate: req.body.outDate,
      returnDate: req.body.returnDate,
      type: req.body.type || 'Day Pass',
      status: 'Pending',
      wardenRemarks: '',
      submittedBy: req.user ? req.user._id : undefined
    });

    res.status(201).json({ success: true, data: pass });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/gatepasses/:id  (warden approves/rejects)
const reviewGatePass = async (req, res, next) => {
  try {
    const { status, wardenRemarks } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const statusError = validateEnum(status, ['Pending', 'Approved', 'Rejected'], 'Status');
    if (statusError) return res.status(400).json({ success: false, message: statusError });

    if (!isDBConnected()) {
      fallbackPasses = fallbackPasses.map(g =>
        (g._id === req.params.id || g.passId === req.params.id)
          ? { ...g, status, wardenRemarks: wardenRemarks || '' }
          : g
      );
      const updated = fallbackPasses.find(g => g._id === req.params.id || g.passId === req.params.id);
      return res.json({ success: true, data: updated, source: 'fallback' });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid gate pass ID' });
    }

    const updated = await GatePass.findByIdAndUpdate(
      req.params.id,
      {
        status,
        wardenRemarks: wardenRemarks || '',
        reviewedBy: req.user._id,
        reviewedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: 'Gate pass not found' });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/gatepasses/:id  (warden only)
const deleteGatePass = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      fallbackPasses = fallbackPasses.filter(g => g._id !== req.params.id && g.passId !== req.params.id);
      return res.json({ success: true, message: 'Gate pass deleted' });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid gate pass ID' });
    }

    const pass = await GatePass.findByIdAndDelete(req.params.id);
    if (!pass) return res.status(404).json({ success: false, message: 'Gate pass not found' });

    res.json({ success: true, message: 'Gate pass deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getGatePasses, getGatePass, createGatePass, reviewGatePass, deleteGatePass };
