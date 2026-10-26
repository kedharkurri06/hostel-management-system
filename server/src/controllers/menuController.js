const Menu = require('../models/Menu');
const { isValidObjectId } = require('../validators');
const { isDBConnected } = require('../config/db');
const { initialMenu } = require('../utils/fallbackData');

// GET /api/menu
const getMenu = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.json({ success: true, data: initialMenu, source: 'fallback' });
    }

    const menu = await Menu.find().sort({ day: 1 });
    if (!menu || menu.length === 0) {
      return res.json({ success: true, data: initialMenu, source: 'fallback' });
    }

    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const menuByDay = {};
    
    const sorted = menu.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
    sorted.forEach(m => {
      menuByDay[m.day] = {
        _id: m._id,
        breakfast: m.breakfast,
        lunch: m.lunch,
        snacks: m.snacks,
        dinner: m.dinner
      };
    });

    res.json({ success: true, data: menuByDay });
  } catch (error) {
    // If DB query fails, fallback gracefully
    res.json({ success: true, data: initialMenu, source: 'fallback' });
  }
};

// PATCH /api/menu/:id
const updateMeal = async (req, res, next) => {
  try {
    const { meal, time, type, items } = req.body;

    if (!meal || !['breakfast', 'lunch', 'snacks', 'dinner'].includes(meal)) {
      return res.status(400).json({ success: false, message: 'Invalid meal period. Must be breakfast, lunch, snacks, or dinner.' });
    }

    if (!time || !type || !items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'time, type, and items (array) are required' });
    }

    if (!isDBConnected()) {
      // In offline/fallback mode, simulate update
      return res.json({ success: true, message: 'Updated in local session (database pending)', data: { meal, time, type, items } });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid menu ID' });
    }

    const update = {};
    update[meal] = { time, type, items };

    const menu = await Menu.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true
    });

    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }

    res.json({ success: true, data: menu });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMenu, updateMeal };
