const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getCalendarData } = require('../controllers/calendarController');

router.use(protect);

// @route   GET /api/calendar
// @desc    Get aggregated calendar events & today panel data
// @access  Private
router.get('/', (req, res) => getCalendarData(req, res));

module.exports = router;
