const mongoose = require('mongoose');
const Task = require('../models/Task');
const Exam = require('../models/Exam');
const Goal = require('../models/Goal');
const FocusSession = require('../models/FocusSession');
const asyncHandler = require('../utils/asyncHandler');

// Helper to format date as YYYY-MM-DD
const formatDateKey = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Get aggregated calendar data for logged in user
// @route   GET /api/calendar
// @access  Private
const getCalendarData = asyncHandler(async (req, res, mockStore) => {
  const user = req.user;
  if (!user) return res.status(401).json({ success: false, message: 'Not authorized' });

  const isMongoDBConnected = mongoose.connection && mongoose.connection.readyState === 1;

  let userTasks = [];
  let userExams = [];
  let userGoals = [];
  let userSessions = [];

  if (isMongoDBConnected) {
    userTasks = await Task.find({ user: user._id }).lean();
    userExams = await Exam.find({ user: user._id }).lean();
    userGoals = await Goal.find({ user: user._id }).lean();
    userSessions = await FocusSession.find({ user: user._id, mode: 'work' }).lean();
  } else if (mockStore && typeof mockStore.getAnalyticsRawData === 'function') {
    const raw = mockStore.getAnalyticsRawData(user._id);
    userTasks = raw.tasks || [];
    userExams = raw.exams || [];
    userSessions = raw.sessions || [];
    if (typeof mockStore.getGoals === 'function') {
      userGoals = mockStore.getGoals(user._id);
    }
  }

  const events = [];

  // 1. Task Events
  userTasks.forEach((t) => {
    let color = '#f59e0b'; // Amber for pending
    if (t.status === 'completed') color = '#10b981'; // Emerald
    else if (t.status === 'overdue' || new Date(t.dueDate) < new Date()) color = '#f43f5e'; // Rose

    events.push({
      id: `task-${t._id}`,
      sourceId: t._id,
      title: `📋 ${t.title}`,
      subject: t.subject || 'General',
      start: new Date(t.dueDate),
      end: new Date(t.dueDate),
      allDay: true,
      type: 'task',
      status: t.status,
      priority: t.priority,
      color,
      originalData: t,
    });
  });

  // 2. Exam Events
  userExams.forEach((e) => {
    events.push({
      id: `exam-${e._id}`,
      sourceId: e._id,
      title: `🎓 EXAM: ${e.subject}`,
      subject: e.subject,
      start: new Date(e.examDate),
      end: new Date(e.examDate),
      allDay: true,
      type: 'exam',
      color: e.colorTag || '#ef4444',
      originalData: e,
    });
  });

  // 3. Goal Milestone Events
  userGoals.forEach((g) => {
    (g.milestones || []).forEach((m) => {
      const targetDate = m.completedAt || g.targetDate;
      events.push({
        id: `milestone-${m._id || m.title}`,
        sourceId: m._id,
        goalId: g._id,
        title: `🎯 ${m.title} (${g.title})`,
        subject: g.category || 'Goal',
        start: new Date(targetDate),
        end: new Date(targetDate),
        allDay: true,
        type: 'milestone',
        status: m.completed ? 'Completed' : 'In Progress',
        color: '#a855f7', // Purple
        originalData: { ...m, goalTitle: g.title, goalId: g._id, category: g.category },
      });
    });
  });

  // 4. Focus Session Events
  userSessions.forEach((s) => {
    const sessionDate = new Date(s.completedAt);
    events.push({
      id: `focus-${s._id}`,
      sourceId: s._id,
      title: `⏱️ Focus (${s.durationMinutes || 25}m)`,
      subject: s.subject || 'General',
      start: sessionDate,
      end: new Date(sessionDate.getTime() + (s.durationMinutes || 25) * 60000),
      allDay: false,
      type: 'focus',
      color: '#10b981', // Emerald
      originalData: s,
    });
  });

  // Today Panel Metrics
  const todayKey = formatDateKey(new Date());
  const todayTasks = userTasks.filter((t) => formatDateKey(t.dueDate) === todayKey);
  const todayCompletedTasks = todayTasks.filter((t) => t.status === 'completed');
  const todayProgress = todayTasks.length > 0 ? Math.round((todayCompletedTasks.length / todayTasks.length) * 100) : 0;

  const todayFocusSessions = userSessions.filter((s) => formatDateKey(s.completedAt) === todayKey);
  const todayFocusMinutes = todayFocusSessions.reduce((acc, s) => acc + (s.durationMinutes || 25), 0);

  const upcomingExams = userExams
    .filter((e) => new Date(e.examDate) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.examDate) - new Date(b.examDate));

  const nextExam = upcomingExams.length > 0 ? {
    ...upcomingExams[0],
    daysRemaining: Math.max(0, Math.ceil((new Date(upcomingExams[0].examDate) - new Date()) / (1000 * 60 * 60 * 24))),
  } : null;

  return res.json({
    success: true,
    data: {
      events,
      today: {
        date: new Date(),
        tasks: todayTasks,
        completedCount: todayCompletedTasks.length,
        totalTasks: todayTasks.length,
        progress: todayProgress,
        focusMinutes: todayFocusMinutes,
        focusSessionsCount: todayFocusSessions.length,
      },
      nextExam,
      upcomingExams: upcomingExams.slice(0, 5),
    },
  });
});

module.exports = {
  getCalendarData,
};
