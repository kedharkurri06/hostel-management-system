const express = require('express');
const router = express.Router();
const {
  getWardens,
  createWarden,
  updateWarden,
  deleteWarden,
  createStaff,
  updateStaff,
  deleteStaff
} = require('../controllers/wardenController');
const { protect, authorize } = require('../middleware/auth');

// Public read directory (wardens and maintenance staff)
router.get('/', getWardens);

// Maintenance Staff / Technicians Management (Warden only)
router.post('/staff', protect, authorize('warden'), createStaff);
router.patch('/staff/:id', protect, authorize('warden'), updateStaff);
router.delete('/staff/:id', protect, authorize('warden'), deleteStaff);

// Warden Profile Management (Warden only)
router.post('/', protect, authorize('warden'), createWarden);
router.patch('/:id', protect, authorize('warden'), updateWarden);
router.delete('/:id', protect, authorize('warden'), deleteWarden);

module.exports = router;
