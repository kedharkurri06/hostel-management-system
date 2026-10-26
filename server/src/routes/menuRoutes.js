const express = require('express');
const router = express.Router();
const { getMenu, updateMeal } = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getMenu);
router.patch('/:id', protect, authorize('warden'), updateMeal);

module.exports = router;
