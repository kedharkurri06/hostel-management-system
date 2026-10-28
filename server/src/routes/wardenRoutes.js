const express = require('express');
const router = express.Router();
const {
  getWardens,
  createWarden,
  updateWarden,
  deleteWarden
} = require('../controllers/wardenController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getWardens);
router.post('/', protect, authorize('warden'), createWarden);
router.patch('/:id', protect, authorize('warden'), updateWarden);
router.delete('/:id', protect, authorize('warden'), deleteWarden);

module.exports = router;
