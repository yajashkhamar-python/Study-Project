const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getAnalyticsData, logFocusSession } = require('../controllers/analyticsController');

// @route   GET /api/analytics
// @desc    Get aggregated analytics dashboard data
// @access  Private
router.get('/', protect, (req, res) => getAnalyticsData(req, res));

// @route   POST /api/analytics/focus-session
// @desc    Log a completed Pomodoro focus session
// @access  Private
router.post('/focus-session', protect, (req, res) => logFocusSession(req, res));

module.exports = router;
