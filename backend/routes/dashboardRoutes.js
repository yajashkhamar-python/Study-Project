const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getWeeklyActivity,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/weekly', getWeeklyActivity);

module.exports = router;
