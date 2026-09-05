const mongoose = require('mongoose');
const Task = require('../models/Task');
const Exam = require('../models/Exam');
const Goal = require('../models/Goal');
const Note = require('../models/Note');
const FocusSession = require('../models/FocusSession');
const AIConversation = require('../models/AIConversation');
const asyncHandler = require('../utils/asyncHandler');
const { generateAIResponse, generateStudyPlan } = require('../services/aiService');

/**
 * Helper to generate simple clean conversation title from first prompt
 */
const generateConversationTitle = (message) => {
  const cleanStr = message.trim().replace(/[\r\n]+/g, ' ');
  if (cleanStr.length <= 50) return cleanStr;
  return cleanStr.slice(0, 47) + '...';
};

/**
 * Gather user tasks, exams, stats to build structured context
 */
const buildStudentContext = async (user, mockDataGetter) => {
  let userTasks = [];
  let userExams = [];

  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      userTasks = await Task.find({ user: user._id }).sort({ dueDate: 1 }).lean();
      userExams = await Exam.find({ user: user._id }).sort({ examDate: 1 }).lean();
    } else if (typeof mockDataGetter === 'function') {
      const data = mockDataGetter(user._id);
      userTasks = data.tasks || [];
      userExams = data.exams || [];
    }
  } catch (err) {
    console.error('Error fetching student context data:', err);
  }

  const now = new Date();

  // Task status classification
  const pendingTasks = userTasks.filter((t) => t.status === 'pending' || t.status === 'in-progress');
  const overdueTasks = userTasks.filter(
    (t) => t.status === 'overdue' || (t.status !== 'completed' && new Date(t.dueDate) < now)
  );
  const completedTasks = userTasks.filter((t) => t.status === 'completed');

  const total = userTasks.length;
  const completedCount = completedTasks.length;
  const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  let contextStr = `Student Profile:
Name: ${user.name || 'Student'}
Timezone: ${user.timezone || 'UTC'}
Subjects: ${user.preferences?.subjects ? user.preferences.subjects.join(', ') : 'Mathematics, Physics, Computer Science'}
Daily Goal: ${user.preferences?.dailyGoalMinutes || 120} minutes

Study Progress Stats:
- Overall Completion Rate: ${completionRate}%
- Total Tasks: ${total}
- Completed Tasks: ${completedCount}
- Pending Tasks: ${pendingTasks.length}
- Overdue Tasks: ${overdueTasks.length}

Upcoming Exams:
`;

  if (userExams.length === 0) {
    contextStr += `- No upcoming exams currently scheduled.\n`;
  } else {
    userExams.forEach((e) => {
      const dateStr = new Date(e.examDate).toLocaleDateString();
      contextStr += `- ${e.subject} on ${dateStr} at ${e.examTime || 'TBA'} (Venue: ${e.venue || 'N/A'}). Notes: ${e.syllabusNotes || 'None'}\n`;
    });
  }

  contextStr += `\nPending Tasks:\n`;
  if (pendingTasks.length === 0) {
    contextStr += `- No pending tasks.\n`;
  } else {
    pendingTasks.forEach((t) => {
      const dueStr = new Date(t.dueDate).toLocaleDateString();
      contextStr += `- [Priority: ${t.priority || 'medium'}] ${t.title} (${t.subject || 'General'}) - Due: ${dueStr}, Est: ${t.estimatedMinutes || 60} mins\n`;
    });
  }

  contextStr += `\nOverdue Tasks:\n`;
  if (overdueTasks.length === 0) {
    contextStr += `- No overdue tasks.\n`;
  } else {
    overdueTasks.forEach((t) => {
      const dueStr = new Date(t.dueDate).toLocaleDateString();
      contextStr += `- ${t.title} (${t.subject || 'General'}) - Due date was: ${dueStr}\n`;
    });
  }

  return contextStr;
};

// @desc    Handle chat with StudyPulse AI and persist conversation
// @route   POST /api/ai/chat
// @access  Private
const chatWithAI = asyncHandler(async (req, res, mockStore) => {
  const { message, conversationHistory, conversationId } = req.body;

  // Validate message string
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid message.',
    });
  }

  if (message.length > 4000) {
    return res.status(400).json({
      success: false,
      message: 'Message is too long. Please keep your request under 4000 characters.',
    });
  }

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized.',
    });
  }

  try {
    const studentContext = await buildStudentContext(
      req.user,
      typeof mockStore === 'object' ? mockStore.getMockContextData : undefined
    );

    let conversation = null;
    let historyToPass = Array.isArray(conversationHistory) ? conversationHistory : [];

    const isMongoDBConnected = mongoose.connection && mongoose.connection.readyState === 1;

    // Load or create conversation
    if (isMongoDBConnected) {
      if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
        conversation = await AIConversation.findOne({ _id: conversationId, user: req.user._id });
      }

      if (!conversation) {
        conversation = new AIConversation({
          user: req.user._id,
          title: generateConversationTitle(message),
          messages: [],
        });
      }

      if (conversation.messages.length > 0 && historyToPass.length === 0) {
        historyToPass = conversation.messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));
      }

      // Add user message to conversation
      conversation.messages.push({
        role: 'user',
        content: message.trim(),
      });
    } else if (mockStore && typeof mockStore.saveMessage === 'function') {
      // In-memory mock server support
      const mockResult = mockStore.getOrCreateConversation(req.user._id, conversationId, message);
      conversation = mockResult.conversation;
      if (mockResult.history && historyToPass.length === 0) {
        historyToPass = mockResult.history;
      }
    }

    // Generate response from AI service
    const aiMessage = await generateAIResponse(message.trim(), historyToPass, studentContext);

    // Save assistant response
    if (isMongoDBConnected && conversation) {
      conversation.messages.push({
        role: 'assistant',
        content: aiMessage,
      });
      await conversation.save();
    } else if (mockStore && typeof mockStore.saveMessage === 'function' && conversation) {
      mockStore.saveMessage(conversation._id, 'assistant', aiMessage);
    }

    return res.status(200).json({
      success: true,
      message: aiMessage,
      conversationId: conversation ? conversation._id.toString() : null,
      title: conversation ? conversation.title : 'Study Chat',
    });
  } catch (error) {
    console.error('AI Controller Error:', error);
    const detailMsg = error?.message || 'Unable to process your AI request right now. Please try again later.';
    return res.status(500).json({
      success: false,
      message: detailMsg,
    });
  }
});

// @desc    Get user conversations (lightweight metadata)
// @route   GET /api/ai/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res, mockStore) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authorized.' });
  }

  const isMongoDBConnected = mongoose.connection && mongoose.connection.readyState === 1;

  if (isMongoDBConnected) {
    const conversations = await AIConversation.find({ user: req.user._id })
      .select('_id title updatedAt createdAt')
      .sort({ updatedAt: -1 })
      .lean();

    return res.json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } else if (mockStore && typeof mockStore.getUserConversations === 'function') {
    const list = mockStore.getUserConversations(req.user._id);
    return res.json({ success: true, count: list.length, data: list });
  }

  return res.json({ success: true, count: 0, data: [] });
});

// @desc    Get single conversation with full messages
// @route   GET /api/ai/conversations/:id
// @access  Private
const getConversationById = asyncHandler(async (req, res, mockStore) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authorized.' });
  }

  const { id } = req.params;
  const isMongoDBConnected = mongoose.connection && mongoose.connection.readyState === 1;

  if (isMongoDBConnected) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const conversation = await AIConversation.findOne({ _id: id, user: req.user._id }).lean();

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    return res.json({
      success: true,
      data: conversation,
    });
  } else if (mockStore && typeof mockStore.getConversationById === 'function') {
    const conv = mockStore.getConversationById(req.user._id, id);
    if (!conv) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }
    return res.json({ success: true, data: conv });
  }

  return res.status(404).json({ success: false, message: 'Conversation not found.' });
});

// @desc    Delete a conversation
// @route   DELETE /api/ai/conversations/:id
// @access  Private
const deleteConversation = asyncHandler(async (req, res, mockStore) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authorized.' });
  }

  const { id } = req.params;
  const isMongoDBConnected = mongoose.connection && mongoose.connection.readyState === 1;

  if (isMongoDBConnected) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const conversation = await AIConversation.findOne({ _id: id, user: req.user._id });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    await conversation.deleteOne();

    return res.json({
      success: true,
      message: 'Conversation removed.',
    });
  } else if (mockStore && typeof mockStore.deleteConversation === 'function') {
    mockStore.deleteConversation(req.user._id, id);
    return res.json({ success: true, message: 'Conversation removed.' });
  }

  return res.status(404).json({ success: false, message: 'Conversation not found.' });
});

/**
 * Gather user tasks, exams, goals, notes, analytics to build rich structured planner context
 */
const buildPlannerContext = async (user, mockStore, preferences = {}) => {
  let userTasks = [];
  let userExams = [];
  let userGoals = [];
  let userNotes = [];
  let userSessions = [];

  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      userTasks = await Task.find({ user: user._id }).sort({ dueDate: 1 }).lean();
      userExams = await Exam.find({ user: user._id }).sort({ examDate: 1 }).lean();
      userGoals = await Goal.find({ user: user._id }).lean();
      userNotes = await Note.find({ user: user._id }).select('title subject tags').lean();
      userSessions = await FocusSession.find({ user: user._id }).lean();
    } else if (typeof mockStore === 'object' && typeof mockStore.getPlannerContextData === 'function') {
      const data = mockStore.getPlannerContextData(user._id);
      userTasks = data.tasks || [];
      userExams = data.exams || [];
      userGoals = data.goals || [];
      userNotes = data.notes || [];
      userSessions = data.sessions || [];
    }
  } catch (err) {
    console.error('Error fetching detailed planner context data:', err);
  }

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Subject analytics calculation
  const subjectStats = {};
  userSessions.forEach((s) => {
    const sub = s.subject || 'General';
    if (!subjectStats[sub]) subjectStats[sub] = { minutes: 0, completedCount: 0 };
    subjectStats[sub].minutes += s.durationMinutes || 25;
  });

  userTasks.forEach((t) => {
    const sub = t.subject || 'General';
    if (!subjectStats[sub]) subjectStats[sub] = { minutes: 0, completedCount: 0 };
    if (t.status === 'completed') subjectStats[sub].completedCount += 1;
  });

  const sortedSubjects = Object.keys(subjectStats)
    .map((sub) => ({
      subject: sub,
      minutes: subjectStats[sub].minutes,
      completed: subjectStats[sub].completedCount,
    }))
    .sort((a, b) => a.minutes - b.minutes);

  const pendingTasks = userTasks.filter((t) => t.status === 'pending' || t.status === 'in-progress');
  const overdueTasks = userTasks.filter(
    (t) => t.status === 'overdue' || (t.status !== 'completed' && new Date(t.dueDate) < now)
  );

  let contextStr = `STUDENT PROFILE:
Name: ${user.name || 'Student'}
Timezone: ${user.timezone || 'UTC'}
Today's Date: ${todayStr}
Available Daily Study Time Requested: ${preferences.dailyMinutes || 120} minutes
Requested Planning Period: ${preferences.days || 7} days
Selected Focus Areas: ${(preferences.focus || []).join(', ') || 'Exams, Tasks, Weak Subjects'}

UPCOMING EXAMS:
`;

  if (userExams.length === 0) {
    contextStr += `- No upcoming exams currently scheduled.\n`;
  } else {
    userExams.forEach((e) => {
      const examDate = new Date(e.examDate);
      const daysRemaining = Math.max(0, Math.ceil((examDate - now) / (1000 * 60 * 60 * 24)));
      const dateStr = examDate.toISOString().split('T')[0];
      contextStr += `- Exam: "${e.subject}" | Date: ${dateStr} (${daysRemaining} days remaining) | Venue: ${e.venue || 'N/A'} | Notes: ${e.syllabusNotes || 'None'}\n`;
    });
  }

  contextStr += `\nOVERDUE TASKS:\n`;
  if (overdueTasks.length === 0) {
    contextStr += `- No overdue tasks.\n`;
  } else {
    overdueTasks.forEach((t) => {
      const dueStr = new Date(t.dueDate).toISOString().split('T')[0];
      contextStr += `- [OVERDUE] "${t.title}" | Subject: ${t.subject || 'General'} | Priority: ${t.priority || 'medium'} | Due: ${dueStr} | Est: ${t.estimatedMinutes || 60} mins\n`;
    });
  }

  contextStr += `\nPENDING TASKS:\n`;
  if (pendingTasks.length === 0) {
    contextStr += `- No pending tasks.\n`;
  } else {
    pendingTasks.forEach((t) => {
      const dueStr = new Date(t.dueDate).toISOString().split('T')[0];
      contextStr += `- "${t.title}" | Subject: ${t.subject || 'General'} | Priority: ${t.priority || 'medium'} | Due: ${dueStr} | Est: ${t.estimatedMinutes || 60} mins\n`;
    });
  }

  contextStr += `\nSTUDY GOALS & MILESTONES:\n`;
  if (userGoals.length === 0) {
    contextStr += `- No active goals registered.\n`;
  } else {
    userGoals.forEach((g) => {
      const targetStr = g.targetDate ? new Date(g.targetDate).toISOString().split('T')[0] : 'N/A';
      contextStr += `- Goal: "${g.title}" | Category: ${g.category || 'Academic'} | Priority: ${g.priority || 'medium'} | Target Date: ${targetStr} | Status: ${g.status || 'In Progress'}\n`;
      if (g.milestones && g.milestones.length > 0) {
        g.milestones.forEach((m) => {
          contextStr += `   * Milestone: "${m.title}" (${m.completed ? 'COMPLETED' : 'PENDING'})\n`;
        });
      }
    });
  }

  contextStr += `\nSUBJECT ANALYTICS & WEAKNESSES:\n`;
  if (sortedSubjects.length === 0) {
    contextStr += `- No subject analytics logged yet.\n`;
  } else {
    sortedSubjects.forEach((s) => {
      contextStr += `- Subject: "${s.subject}" | Logged Focus Minutes: ${s.minutes} mins | Completed Tasks: ${s.completed}\n`;
    });
  }

  contextStr += `\nRELEVANT NOTES & TOPICS AVAILABLE:\n`;
  if (userNotes.length === 0) {
    contextStr += `- No study notes created.\n`;
  } else {
    userNotes.forEach((n) => {
      contextStr += `- Note: "${n.title}" | Subject: ${n.subject || 'General'} ${n.tags ? `| Tags: ${n.tags.join(', ')}` : ''}\n`;
    });
  }

  return contextStr;
};

// @desc    Generate personalized AI Study Plan
// @route   POST /api/ai/study-plan
// @access  Private
const generateStudyPlanController = asyncHandler(async (req, res, mockStore) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized.',
    });
  }

  let { dailyMinutes, days, focus } = req.body || {};

  // Input validation
  dailyMinutes = parseInt(dailyMinutes, 10);
  if (isNaN(dailyMinutes) || dailyMinutes < 15 || dailyMinutes > 720) {
    dailyMinutes = 120;
  }

  days = parseInt(days, 10);
  if (isNaN(days) || ![3, 7, 14, 30].includes(days)) {
    days = 7;
  }

  if (!Array.isArray(focus) || focus.length === 0) {
    focus = ['exams', 'tasks', 'weakSubjects'];
  }

  const preferences = { dailyMinutes, days, focus };

  try {
    const studentContext = await buildPlannerContext(
      req.user,
      typeof mockStore === 'object' ? mockStore : undefined,
      preferences
    );

    const rawPlan = await generateStudyPlan(studentContext, preferences);

    // Validate and sanitize response
    if (!rawPlan || typeof rawPlan !== 'object' || !Array.isArray(rawPlan.days)) {
      throw new Error('Invalid plan structure generated by AI service.');
    }

    const allowedTypes = ['revision', 'practice', 'assignment', 'exam-prep', 'goal', 'reading'];

    const sanitizedDays = rawPlan.days.map((day, idx) => {
      const d = new Date();
      d.setDate(d.getDate() + idx);
      const fallbackDateStr = d.toISOString().split('T')[0];
      const dayDate = day.date || fallbackDateStr;

      let totalDayMins = 0;
      const validSessions = (day.sessions || []).map((s, sIdx) => {
        let duration = parseInt(s.durationMinutes, 10);
        if (isNaN(duration) || duration <= 0) duration = 30;

        let sessionType = (s.type || 'revision').toLowerCase();
        if (!allowedTypes.includes(sessionType)) {
          sessionType = 'revision';
        }

        totalDayMins += duration;

        return {
          id: `session-${idx}-${sIdx}-${Date.now()}`,
          title: s.title || `Study Session ${sIdx + 1}`,
          subject: s.subject || 'General',
          durationMinutes: duration,
          type: sessionType,
          reason: s.reason || 'Recommended by AI planner based on syllabus',
        };
      });

      // Enforce daily study limit: scale sessions if total exceeds dailyMinutes
      if (totalDayMins > dailyMinutes && validSessions.length > 0) {
        const scaleFactor = dailyMinutes / totalDayMins;
        validSessions.forEach((s) => {
          s.durationMinutes = Math.max(10, Math.floor(s.durationMinutes * scaleFactor));
        });
      }

      return {
        date: dayDate,
        sessions: validSessions,
      };
    });

    return res.status(200).json({
      success: true,
      plan: {
        days: sanitizedDays,
      },
      preferences,
    });
  } catch (error) {
    console.error('Study Plan Generation Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Unable to generate your study plan right now.',
    });
  }
});

module.exports = {
  chatWithAI,
  getConversations,
  getConversationById,
  deleteConversation,
  buildStudentContext,
  buildPlannerContext,
  generateStudyPlanController,
};

