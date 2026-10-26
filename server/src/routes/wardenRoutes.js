const express = require('express');
const router = express.Router();
const { getWardens } = require('../controllers/wardenController');

router.get('/', getWardens);

module.exports = router;
