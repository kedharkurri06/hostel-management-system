const express = require('express');
const router = express.Router();
const {
  getComplaints,
  getComplaint,
  createComplaint,
  updateComplaint,
  deleteComplaint
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getComplaints);
router.get('/:id', protect, getComplaint);
router.post('/', protect, createComplaint);
router.patch('/:id', protect, authorize('warden'), updateComplaint);
router.delete('/:id', protect, authorize('warden'), deleteComplaint);

module.exports = router;
