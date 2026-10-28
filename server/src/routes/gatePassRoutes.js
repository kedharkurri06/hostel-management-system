const express = require('express');
const router = express.Router();
const {
  getGatePasses,
  getGatePass,
  createGatePass,
  reviewGatePass,
  deleteGatePass
} = require('../controllers/gatePassController');
const { protect, authorize } = require('../middleware/auth');

// Students and wardens can get gate passes (controller filters by role)
router.get('/', protect, getGatePasses);
router.get('/:id', protect, getGatePass);

// Student can apply for gate pass
router.post('/', protect, createGatePass);

// Warden can approve/reject gate pass
router.patch('/:id', protect, authorize('warden'), reviewGatePass);

// Warden can delete
router.delete('/:id', protect, authorize('warden'), deleteGatePass);

module.exports = router;
