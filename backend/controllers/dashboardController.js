const Task = require('../models/Task');
const Exam = require('../models/Exam');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get main dashboard aggregate statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Auto sync overdue status first
  const now = new Date();
  await Task.updateMany(
    { user: userId, status: { $ne: 'completed' }, dueDate: { $lt: now } },
    { $set: { status: 'overdue' } }
  );

  const totalTasks = await Task.countDocuments({ user: userId });
  const completedTasks = await Task.countDocuments({ user: userId, status: 'completed' });
  const pendingTasks = await Task.countDocuments({ user: userId, status: { $in: ['pending', 'in-progress'] } });
  const overdueTasks = await Task.countDocuments({ user: userId, status: 'overdue' });

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Next upcoming exams
  const upcomingExams = await Exam.find({ user: userId, examDate: { $gte: new Date() } })
    .sort({ examDate: 1 })
    .limit(3);

  // Subject-wise tasks calculation for Bar Chart
  const tasksBySubjectAgg = await Task.aggregate([
    { $match: { user: userId } },
    { $group: { _id: '$subject', count: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } },
  ]);

  const tasksBySubject = tasksBySubjectAgg.map((item) => ({
    subject: item._id || 'Unassigned',
    total: item.count,
    completed: item.completed,
  }));

  // Study streak calculation: consecutive days with completed tasks
  const completedDates = await Task.distinct('completedAt', {
    user: userId,
    status: 'completed',
    completedAt: { $ne: null },
  });

  let currentStreak = 0;
  if (completedDates.length > 0) {
    const uniqueDays = Array.from(
      new Set(completedDates.map((d) => new Date(d).toISOString().split('T')[0]))
    ).sort((a, b) => new Date(b) - new Date(a));

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (uniqueDays.includes(todayStr) || uniqueDays.includes(yesterdayStr)) {
      currentStreak = 1;
      let checkDate = new Date(uniqueDays.includes(todayStr) ? todayStr : yesterdayStr);

      for (let i = 1; i < 365; i++) {
        checkDate.setDate(checkDate.getDate() - 1);
        const dateStr = checkDate.toISOString().split('T')[0];
        if (uniqueDays.includes(dateStr)) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }

  res.json({
    success: true,
    data: {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionRate,
      currentStreak,
      upcomingExams,
      tasksBySubject,
    },
  });
});

// @desc    Get 30-day study activity timeline for Line Chart
// @route   GET /api/dashboard/weekly
// @access  Private
exports.getWeeklyActivity = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const completedTasks = await Task.find({
    user: userId,
    status: 'completed',
    completedAt: { $gte: thirtyDaysAgo },
  });

  // Group by date
  const activityMap = {};
  for (let i = 0; i <= 30; i++) {
    const d = new Date(thirtyDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split('T')[0];
    activityMap[key] = { date: key, completedCount: 0, estimatedMinutes: 0 };
  }

  completedTasks.forEach((task) => {
    if (task.completedAt) {
      const key = new Date(task.completedAt).toISOString().split('T')[0];
      if (activityMap[key]) {
        activityMap[key].completedCount += 1;
        activityMap[key].estimatedMinutes += task.estimatedMinutes || 60;
      }
    }
  });

  const chartData = Object.values(activityMap);

  res.json({
    success: true,
    data: chartData,
  });
});
