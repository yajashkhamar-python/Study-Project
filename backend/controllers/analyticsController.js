const mongoose = require('mongoose');
const Task = require('../models/Task');
const Exam = require('../models/Exam');
const User = require('../models/User');
const FocusSession = require('../models/FocusSession');
const asyncHandler = require('../utils/asyncHandler');

// Helper to format Date as YYYY-MM-DD
const formatDateKey = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper for percentage change calculation
const calcPctChange = (current, previous) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100);
};

// @desc    Get aggregated analytics dashboard data
// @route   GET /api/analytics
// @access  Private
const getAnalyticsData = asyncHandler(async (req, res, mockStore) => {
  const { range = '7days' } = req.query;
  const user = req.user;

  if (!user) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  const now = new Date();
  let startDate = new Date();

  if (range === '7days') {
    startDate.setDate(now.getDate() - 6);
  } else if (range === '30days') {
    startDate.setDate(now.getDate() - 29);
  } else if (range === '90days') {
    startDate.setDate(now.getDate() - 89);
  } else {
    startDate = new Date(0); // All time
  }
  startDate.setHours(0, 0, 0, 0);

  const isMongoDBConnected = mongoose.connection && mongoose.connection.readyState === 1;

  let userTasks = [];
  let userExams = [];
  let userSessions = [];

  if (isMongoDBConnected) {
    userTasks = await Task.find({ user: user._id }).lean();
    userExams = await Exam.find({ user: user._id }).lean();
    userSessions = await FocusSession.find({ user: user._id, mode: 'work' }).lean();
  } else if (mockStore && typeof mockStore.getAnalyticsRawData === 'function') {
    const raw = mockStore.getAnalyticsRawData(user._id);
    userTasks = raw.tasks || [];
    userExams = raw.exams || [];
    userSessions = raw.sessions || [];
  }

  // --- Task Stats ---
  const totalTasks = userTasks.length;
  const completedTasks = userTasks.filter((t) => t.status === 'completed').length;
  const pendingTasks = userTasks.filter((t) => t.status === 'pending' || t.status === 'in-progress').length;
  const overdueTasks = userTasks.filter(
    (t) => t.status === 'overdue' || (t.status !== 'completed' && new Date(t.dueDate) < now)
  ).length;
  const inProgressTasks = userTasks.filter((t) => t.status === 'in-progress').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // --- Focus Sessions Filtering ---
  const filteredSessions = userSessions.filter((s) => new Date(s.completedAt) >= startDate);
  const totalFocusMinutes = filteredSessions.reduce((acc, s) => acc + (s.durationMinutes || 25), 0);
  const totalPomodoroSessions = filteredSessions.length;

  // --- Upcoming Exams ---
  const upcomingExamsList = userExams
    .filter((e) => new Date(e.examDate) >= new Date(now.setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.examDate) - new Date(b.examDate));

  const daysUntilNextExam = upcomingExamsList.length > 0
    ? Math.max(0, Math.ceil((new Date(upcomingExamsList[0].examDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  // --- Study Trend (Daily Focus Minutes) ---
  const daysCount = range === '7days' ? 7 : range === '30days' ? 30 : range === '90days' ? 90 : 30;
  const studyTrendMap = {};
  const taskTrendMap = {};

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = formatDateKey(d);
    studyTrendMap[key] = 0;
    taskTrendMap[key] = 0;
  }

  userSessions.forEach((s) => {
    const key = formatDateKey(s.completedAt);
    if (studyTrendMap[key] !== undefined) {
      studyTrendMap[key] += s.durationMinutes || 25;
    }
  });

  userTasks.forEach((t) => {
    if (t.status === 'completed' && t.completedAt) {
      const key = formatDateKey(t.completedAt);
      if (taskTrendMap[key] !== undefined) {
        taskTrendMap[key] += 1;
      }
    }
  });

  const studyTrend = Object.keys(studyTrendMap).map((date) => ({
    date,
    label: new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    minutes: studyTrendMap[date],
    hours: Number((studyTrendMap[date] / 60).toFixed(1)),
  }));

  const taskTrend = Object.keys(taskTrendMap).map((date) => ({
    date,
    label: new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    completedCount: taskTrendMap[date],
  }));

  // --- Subject-Wise Distribution ---
  const subjectMap = {};
  userTasks.forEach((t) => {
    const subj = t.subject || 'General';
    if (!subjectMap[subj]) subjectMap[subj] = { subject: subj, minutes: 0, taskCount: 0 };
    subjectMap[subj].taskCount += 1;
    if (t.status === 'completed') {
      subjectMap[subj].minutes += t.estimatedMinutes || 45;
    }
  });

  userSessions.forEach((s) => {
    const subj = s.subject || 'General';
    if (!subjectMap[subj]) subjectMap[subj] = { subject: subj, minutes: 0, taskCount: 0 };
    subjectMap[subj].minutes += s.durationMinutes || 25;
  });

  const totalSubjectMins = Object.values(subjectMap).reduce((acc, val) => acc + val.minutes, 0);
  const subjectDistribution = Object.values(subjectMap).map((s) => ({
    ...s,
    percentage: totalSubjectMins > 0 ? Math.round((s.minutes / totalSubjectMins) * 100) : 0,
  })).sort((a, b) => b.minutes - a.minutes);

  // --- Focus Analytics Details ---
  const todayKey = formatDateKey(new Date());
  const sessionsToday = userSessions.filter((s) => formatDateKey(s.completedAt) === todayKey);
  const focusTimeTodayMins = sessionsToday.reduce((acc, s) => acc + (s.durationMinutes || 25), 0);

  const weekStart = new Date();
  weekStart.setDate(now.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);
  const sessionsThisWeek = userSessions.filter((s) => new Date(s.completedAt) >= weekStart);
  const focusTimeThisWeekMins = sessionsThisWeek.reduce((acc, s) => acc + (s.durationMinutes || 25), 0);

  const longestSessionMins = userSessions.length > 0
    ? Math.max(...userSessions.map((s) => s.durationMinutes || 25))
    : 0;

  const avgSessionDurationMins = userSessions.length > 0
    ? Math.round(userSessions.reduce((acc, s) => acc + (s.durationMinutes || 25), 0) / userSessions.length)
    : 0;

  // --- Productive Day Analysis ---
  const weekdayMins = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
  const weekdayCounts = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };

  userSessions.forEach((s) => {
    const dayName = new Date(s.completedAt).toLocaleDateString([], { weekday: 'short' });
    if (weekdayMins[dayName] !== undefined) {
      weekdayMins[dayName] += s.durationMinutes || 25;
      weekdayCounts[dayName] += 1;
    }
  });

  let maxDay = 'Mon';
  let maxVal = -1;
  Object.keys(weekdayMins).forEach((day) => {
    if (weekdayMins[day] > maxVal) {
      maxVal = weekdayMins[day];
      maxDay = day;
    }
  });

  const weekdayBreakdown = Object.keys(weekdayMins).map((day) => ({
    day,
    totalMinutes: weekdayMins[day],
    sessionCount: weekdayCounts[day],
  }));

  // --- Streak Calculation ---
  const activeDatesSet = new Set();
  userSessions.forEach((s) => activeDatesSet.add(formatDateKey(s.completedAt)));
  userTasks.forEach((t) => {
    if (t.status === 'completed' && t.completedAt) {
      activeDatesSet.add(formatDateKey(t.completedAt));
    }
  });

  let currentStreak = 0;
  let streakCheckDate = new Date();
  while (activeDatesSet.has(formatDateKey(streakCheckDate))) {
    currentStreak++;
    streakCheckDate.setDate(streakCheckDate.getDate() - 1);
  }
  // Check yesterday if today hasn't been active yet
  if (currentStreak === 0) {
    streakCheckDate = new Date();
    streakCheckDate.setDate(streakCheckDate.getDate() - 1);
    while (activeDatesSet.has(formatDateKey(streakCheckDate))) {
      currentStreak++;
      streakCheckDate.setDate(streakCheckDate.getDate() - 1);
    }
  }

  // --- Weekly Comparison (This Week vs Previous Week) ---
  const prevWeekStart = new Date();
  prevWeekStart.setDate(now.getDate() - 13);
  prevWeekStart.setHours(0, 0, 0, 0);

  const prevWeekEnd = new Date();
  prevWeekEnd.setDate(now.getDate() - 7);
  prevWeekEnd.setHours(23, 59, 59, 999);

  const prevSessions = userSessions.filter((s) => {
    const d = new Date(s.completedAt);
    return d >= prevWeekStart && d <= prevWeekEnd;
  });
  const prevFocusMins = prevSessions.reduce((acc, s) => acc + (s.durationMinutes || 25), 0);

  const prevTasks = userTasks.filter((t) => {
    if (t.status !== 'completed' || !t.completedAt) return false;
    const d = new Date(t.completedAt);
    return d >= prevWeekStart && d <= prevWeekEnd;
  });
  const currTasks = userTasks.filter((t) => {
    if (t.status !== 'completed' || !t.completedAt) return false;
    const d = new Date(t.completedAt);
    return d >= weekStart;
  });

  const weeklyComparison = {
    studyTime: {
      currentMinutes: focusTimeThisWeekMins,
      previousMinutes: prevFocusMins,
      pctChange: calcPctChange(focusTimeThisWeekMins, prevFocusMins),
    },
    tasksCompleted: {
      currentCount: currTasks.length,
      previousCount: prevTasks.length,
      pctChange: calcPctChange(currTasks.length, prevTasks.length),
    },
    focusSessions: {
      currentCount: sessionsThisWeek.length,
      previousCount: prevSessions.length,
      pctChange: calcPctChange(sessionsThisWeek.length, prevSessions.length),
    },
  };

  // --- Deterministic Productivity Score (0 - 100) ---
  // Formula:
  // 1. Task Completion Rate (35 pts max)
  // 2. Focus Time Target (25 pts max - target: 120 mins/day)
  // 3. Streak & Consistency (20 pts max - 3 pts per streak day up to 20)
  // 4. Activity Rate past 14 days (20 pts max)
  // 5. Overdue Penalty (-5 pts per overdue task, max -15 pts)
  const taskPts = Math.round((completionRate / 100) * 35);
  const avgDailyMins = focusTimeThisWeekMins / 7;
  const focusPts = Math.min(25, Math.round((avgDailyMins / 120) * 25));
  const streakPts = Math.min(20, currentStreak * 3);
  const activeDays14 = Array.from({ length: 14 }).filter((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - idx);
    return activeDatesSet.has(formatDateKey(d));
  }).length;
  const activityPts = Math.min(20, Math.round((activeDays14 / 14) * 20));
  const overduePenalty = Math.min(15, overdueTasks * 5);

  let rawScore = taskPts + focusPts + streakPts + activityPts - overduePenalty;
  const productivityScore = Math.max(0, Math.min(100, rawScore));

  let scoreTier = 'Needs Focus';
  if (productivityScore >= 85) scoreTier = 'Exceptional';
  else if (productivityScore >= 70) scoreTier = 'Great';
  else if (productivityScore >= 50) scoreTier = 'Good';

  // --- 12-Week Heatmap Data (84 days) ---
  const heatmap = [];
  for (let i = 83; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = formatDateKey(d);

    const daySessions = userSessions.filter((s) => formatDateKey(s.completedAt) === key);
    const dayMins = daySessions.reduce((acc, s) => acc + (s.durationMinutes || 25), 0);
    const dayTasks = userTasks.filter((t) => t.status === 'completed' && t.completedAt && formatDateKey(t.completedAt) === key).length;

    let intensity = 0;
    if (dayMins > 120 || dayTasks >= 4) intensity = 4;
    else if (dayMins >= 60 || dayTasks >= 2) intensity = 3;
    else if (dayMins >= 30 || dayTasks >= 1) intensity = 2;
    else if (dayMins > 0) intensity = 1;

    heatmap.push({
      date: key,
      formattedDate: d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      focusMinutes: dayMins,
      completedTasks: dayTasks,
      pomodoroCount: daySessions.length,
      intensity,
    });
  }

  return res.json({
    success: true,
    data: {
      range,
      overview: {
        totalStudyMinutes: totalFocusMinutes,
        totalStudyHours: Number((totalFocusMinutes / 60).toFixed(1)),
        completedTasks,
        pendingTasks,
        inProgressTasks,
        overdueTasks,
        totalTasks,
        completionRate,
        currentStreak,
        longestStreak: Math.max(currentStreak, activeDatesSet.size),
        pomodoroSessions: totalPomodoroSessions,
        upcomingExamsCount: upcomingExamsList.length,
        daysUntilNextExam,
      },
      productivityScore: {
        score: productivityScore,
        tier: scoreTier,
        breakdown: {
          taskCompletionPts: taskPts,
          focusTargetPts: focusPts,
          streakPts: streakPts,
          activityPts: activityPts,
          overduePenalty: overduePenalty,
        },
      },
      studyTrend,
      taskTrend,
      subjectDistribution,
      focusAnalytics: {
        totalFocusMinutes,
        completedSessionsCount: totalPomodoroSessions,
        averageSessionDurationMins: avgSessionDurationMins,
        longestSessionMins: longestSessionMins,
        focusSessionsToday: sessionsToday.length,
        focusTimeTodayMins,
        focusSessionsThisWeek: sessionsThisWeek.length,
        focusTimeThisWeekMins,
        averageDailyFocusMins: Math.round(avgDailyMins),
        mostProductiveDay: maxDay,
        weekdayBreakdown,
      },
      examAnalytics: upcomingExamsList.map((e) => ({
        _id: e._id,
        subject: e.subject,
        examDate: e.examDate,
        formattedDate: new Date(e.examDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
        examTime: e.examTime,
        venue: e.venue,
        daysRemaining: Math.max(0, Math.ceil((new Date(e.examDate) - new Date()) / (1000 * 60 * 60 * 24))),
      })),
      weeklyComparison,
      heatmap,
    },
  });
});

// @desc    Log a completed Pomodoro Focus Session
// @route   POST /api/analytics/focus-session
// @access  Private
const logFocusSession = asyncHandler(async (req, res, mockStore) => {
  const {
    durationMinutes = 25,
    actualDurationMinutes = null,
    mode = 'work',
    subject = 'General',
    taskId = null,
    title = '',
    completionStatus = 'completed',
    accomplishment = '',
  } = req.body;

  const user = req.user;

  if (!user) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  const isMongoDBConnected = mongoose.connection && mongoose.connection.readyState === 1;

  if (isMongoDBConnected) {
    const session = await FocusSession.create({
      user: user._id,
      durationMinutes,
      actualDurationMinutes: actualDurationMinutes || durationMinutes,
      mode,
      subject,
      title: title || subject || 'Focus Session',
      task: taskId || null,
      completionStatus: completionStatus || 'completed',
      accomplishment: accomplishment || '',
      completedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      data: session,
    });
  } else if (mockStore && typeof mockStore.logFocusSession === 'function') {
    const session = mockStore.logFocusSession(user._id, {
      durationMinutes,
      actualDurationMinutes: actualDurationMinutes || durationMinutes,
      mode,
      subject,
      taskId,
      title,
      completionStatus,
      accomplishment,
    });
    return res.status(201).json({ success: true, data: session });
  }

  return res.status(500).json({ success: false, message: 'Unable to log focus session' });
});

module.exports = {
  getAnalyticsData,
  logFocusSession,
};
