const express = require('express');
const router = express.Router();
const {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice
} = require('../controllers/noticeController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getNotices);
router.post('/', protect, authorize('warden'), createNotice);
router.patch('/:id', protect, authorize('warden'), updateNotice);
router.delete('/:id', protect, authorize('warden'), deleteNotice);

module.exports = router;
