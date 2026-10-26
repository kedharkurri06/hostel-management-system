const express = require('express');
const router = express.Router();
const {
  getComplaints,
  getComplaint,
  createComplaint,
  updateComplaint,
  deleteComplaint
} = require('../controllers/complaintController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');

router.get('/', getComplaints);
router.get('/:id', getComplaint);
router.post('/', optionalAuth, createComplaint);
router.patch('/:id', protect, authorize('warden'), updateComplaint);
router.delete('/:id', protect, authorize('warden'), deleteComplaint);

module.exports = router;
