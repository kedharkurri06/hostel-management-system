const Warden = require('../models/Warden');
const Staff = require('../models/Staff');
const { isDBConnected } = require('../config/db');
const { initialWardens, initialStaff } = require('../utils/fallbackData');

// GET /api/wardens
const getWardens = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.json({
        success: true,
        data: {
          wardens: initialWardens,
          staff: initialStaff
        },
        source: 'fallback'
      });
    }

    const wardens = await Warden.find().sort({ createdAt: 1 });
    const staff = await Staff.find().sort({ createdAt: 1 });

    if (!wardens.length) {
      return res.json({
        success: true,
        data: {
          wardens: initialWardens,
          staff: initialStaff
        },
        source: 'fallback'
      });
    }

    res.json({
      success: true,
      data: {
        wardens,
        staff
      }
    });
  } catch (error) {
    res.json({
      success: true,
      data: {
        wardens: initialWardens,
        staff: initialStaff
      },
      source: 'fallback'
    });
  }
};

module.exports = { getWardens };
