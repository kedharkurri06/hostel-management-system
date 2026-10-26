const Complaint = require('../models/Complaint');
const { validateRequired, validateEnum, isValidObjectId } = require('../validators');
const { isDBConnected } = require('../config/db');
const { initialComplaints } = require('../utils/fallbackData');

// In-memory array for fallback when DB is offline
let fallbackComplaints = [...initialComplaints];

// GET /api/complaints
const getComplaints = async (req, res, next) => {
  try {
    const { status, priority, category, search, page = 1, limit = 20 } = req.query;

    if (!isDBConnected()) {
      let result = [...fallbackComplaints];
      if (status && status !== 'All') result = result.filter(c => c.status === status);
      if (priority && priority !== 'All') result = result.filter(c => c.priority === priority);
      if (category && category !== 'All') result = result.filter(c => c.category === category);
      if (search) {
        const q = search.toLowerCase();
        result = result.filter(c =>
          c.ticketId.toLowerCase().includes(q) ||
          c.roomNo.toLowerCase().includes(q) ||
          c.studentName.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
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
    if (priority) filter.priority = priority;
    if (category && category !== 'All') filter.category = category;

    if (search) {
      const q = search.trim();
      filter.$or = [
        { ticketId: { $regex: q, $options: 'i' } },
        { roomNo: { $regex: q, $options: 'i' } },
        { studentName: { $regex: q, $options: 'i' } },
        { block: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Complaint.countDocuments(filter);
    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: complaints,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.json({
      success: true,
      data: fallbackComplaints,
      source: 'fallback',
      pagination: { page: 1, limit: 20, total: fallbackComplaints.length, pages: 1 }
    });
  }
};

// GET /api/complaints/:id
const getComplaint = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      const found = fallbackComplaints.find(c => c._id === req.params.id || c.ticketId === req.params.id);
      if (!found) return res.status(404).json({ success: false, message: 'Complaint not found' });
      return res.json({ success: true, data: found, source: 'fallback' });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid complaint ID' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

// POST /api/complaints
const createComplaint = async (req, res, next) => {
  try {
    const missing = validateRequired(['studentName', 'phone', 'roomNo', 'block', 'category', 'priority', 'description'], req.body);
    if (missing.length) {
      return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` });
    }

    const blockError = validateEnum(req.body.block, ['Block A (Boys)', 'Block B (Girls)', 'Block C (International)'], 'Block');
    if (blockError) return res.status(400).json({ success: false, message: blockError });

    const catError = validateEnum(req.body.category, ['AC', 'Water', 'Electrical', 'Wi-Fi', 'Cleanliness', 'Furniture', 'Pest Control'], 'Category');
    if (catError) return res.status(400).json({ success: false, message: catError });

    const prioError = validateEnum(req.body.priority, ['Low', 'Medium', 'High', 'Emergency'], 'Priority');
    if (prioError) return res.status(400).json({ success: false, message: prioError });

    const ticketId = `CMP-${Math.floor(1000 + Math.random() * 9000)}`;

    if (!isDBConnected()) {
      const newComplaint = {
        _id: `cmp_${Date.now()}`,
        ticketId,
        studentName: req.body.studentName,
        phone: req.body.phone,
        roomNo: req.body.roomNo,
        block: req.body.block,
        category: req.body.category,
        priority: req.body.priority,
        description: req.body.description,
        visitTimeSlot: req.body.visitTimeSlot || '10:00 AM - 1:00 PM',
        status: 'Pending',
        assignedTo: 'Unassigned',
        resolutionNotes: '',
        createdAt: new Date().toISOString()
      };
      fallbackComplaints.unshift(newComplaint);
      return res.status(201).json({ success: true, data: newComplaint, source: 'fallback' });
    }

    const complaint = await Complaint.create({
      ticketId,
      studentName: req.body.studentName,
      phone: req.body.phone,
      roomNo: req.body.roomNo,
      block: req.body.block,
      category: req.body.category,
      priority: req.body.priority,
      description: req.body.description,
      visitTimeSlot: req.body.visitTimeSlot || '10:00 AM - 1:00 PM',
      status: 'Pending',
      assignedTo: 'Unassigned',
      resolutionNotes: '',
      submittedBy: req.user ? req.user._id : undefined
    });

    res.status(201).json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/complaints/:id
const updateComplaint = async (req, res, next) => {
  try {
    const allowedUpdates = ['status', 'assignedTo', 'resolutionNotes'];
    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (updates.status) {
      const statusError = validateEnum(updates.status, ['Pending', 'In Progress', 'Resolved'], 'Status');
      if (statusError) return res.status(400).json({ success: false, message: statusError });
    }

    if (!isDBConnected()) {
      fallbackComplaints = fallbackComplaints.map(c =>
        (c._id === req.params.id || c.ticketId === req.params.id) ? { ...c, ...updates } : c
      );
      const updated = fallbackComplaints.find(c => c._id === req.params.id || c.ticketId === req.params.id);
      return res.json({ success: true, data: updated, source: 'fallback' });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid complaint ID' });
    }

    const updated = await Complaint.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/complaints/:id
const deleteComplaint = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      fallbackComplaints = fallbackComplaints.filter(c => c._id !== req.params.id && c.ticketId !== req.params.id);
      return res.json({ success: true, message: 'Complaint deleted' });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid complaint ID' });
    }

    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.json({ success: true, message: 'Complaint deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getComplaints, getComplaint, createComplaint, updateComplaint, deleteComplaint };
