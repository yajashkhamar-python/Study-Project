const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const asyncHandler = require('./utils/asyncHandler');
const generateToken = require('./utils/generateToken');
const {
  chatWithAI,
  getConversations,
  getConversationById,
  deleteConversation,
  generateStudyPlanController,
} = require('./controllers/aiController');
const { getAnalyticsData, logFocusSession } = require('./controllers/analyticsController');

const {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  addMilestone,
  toggleMilestone,
  deleteMilestone,
} = require('./controllers/goalController');
const { getCalendarData } = require('./controllers/calendarController');
const {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  togglePinNote,
  toggleImportantNote,
  processNoteAI,
} = require('./controllers/noteController');

// Persistent Disk Data Store Path
const storePath = path.join(__dirname, 'data', 'persistence_store.json');

// Data structures
let users = [];
let tasks = [];
let exams = [];
let notifications = [];
let aiConversations = [];
let focusSessions = [];
let goals = [];
let notes = [];
let idCounter = 100;

const getNextId = () => (idCounter++).toString();

const savePersistentData = () => {
  try {
    const dir = path.dirname(storePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const payload = {
      users,
      tasks,
      exams,
      notifications,
      aiConversations,
      focusSessions,
      goals,
      notes,
      idCounter,
    };
    fs.writeFileSync(storePath, JSON.stringify(payload, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving persistent store to disk:', err);
  }
};

const loadPersistentData = () => {
  try {
    if (fs.existsSync(storePath)) {
      const raw = fs.readFileSync(storePath, 'utf8');
      const parsed = JSON.parse(raw);
      users = parsed.users || [];
      tasks = parsed.tasks || [];
      exams = parsed.exams || [];
      notifications = parsed.notifications || [];
      aiConversations = parsed.aiConversations || [];
      focusSessions = parsed.focusSessions || [];
      goals = parsed.goals || [];
      notes = parsed.notes || [];
      idCounter = parsed.idCounter || 100;
      console.log(`✅ Loaded persistent database store from disk (${tasks.length} tasks, ${exams.length} exams)`);
      return true;
    }
  } catch (err) {
    console.error('Error loading persistent store from disk:', err);
  }
  return false;
};

// Seed demo data ONLY if database store does not exist on disk yet
if (!loadPersistentData()) {
  const demoUserId = 'demo-user-123';
  users.push({
    _id: demoUserId,
    name: 'Demo Student',
    email: 'demo@student.edu',
    passwordHash: '$2a$10$X87v1Z...mock',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    preferences: { dailyGoalMinutes: 120, subjects: ['Mathematics', 'Physics', 'Computer Science'] },
    reminderDaysBefore: 2,
    theme: 'dark',
    timezone: 'UTC',
  });

  tasks.push(
    {
      _id: getNextId(),
      user: demoUserId,
      title: 'Complete Advanced Calculus Problem Set',
      description: 'Solve exercises 1 through 15 in Chapter 4.',
      subject: 'Mathematics',
      dueDate: new Date(Date.now() + 86400000 * 2),
      priority: 'high',
      status: 'in-progress',
      tags: ['Homework'],
      isRecurring: false,
      recurringInterval: 'none',
      estimatedMinutes: 90,
    },
    {
      _id: getNextId(),
      user: demoUserId,
      title: 'Review Data Structures & Algorithms Graphs Chapter',
      description: 'BFS, DFS, Dijkstra algorithms notes.',
      subject: 'Computer Science',
      dueDate: new Date(Date.now() + 86400000 * 4),
      priority: 'urgent',
      status: 'pending',
      tags: ['Exam Prep'],
      isRecurring: false,
      recurringInterval: 'none',
      estimatedMinutes: 120,
    },
    {
      _id: getNextId(),
      user: demoUserId,
      title: 'Quantum Mechanics Lab Report',
      description: 'Submit PDF report for Experiment 3.',
      subject: 'Physics',
      dueDate: new Date(Date.now() - 86400000),
      priority: 'medium',
      status: 'completed',
      completedAt: new Date(),
      tags: ['Lab'],
      isRecurring: false,
      recurringInterval: 'none',
      estimatedMinutes: 60,
    }
  );

  exams.push({
    _id: getNextId(),
    user: demoUserId,
    subject: 'Computer Science Midterm',
    examDate: new Date(Date.now() + 86400000 * 5),
    examTime: '10:00 AM',
    venue: 'Auditorium Hall B',
    syllabusNotes: 'Data Structures, Trees, Graphs, Sorting Algorithms',
    linkedTasks: [],
    colorTag: '#6366f1',
  });

  notifications.push({
    _id: getNextId(),
    user: demoUserId,
    message: 'Welcome to StudyPulse! Demo account successfully initialized.',
    type: 'system',
    isRead: false,
    createdAt: new Date(),
  });

  focusSessions.push(
    {
      _id: getNextId(),
      user: demoUserId,
      durationMinutes: 25,
      mode: 'work',
      subject: 'Computer Science',
      completedAt: new Date(),
    },
    {
      _id: getNextId(),
      user: demoUserId,
      durationMinutes: 50,
      mode: 'work',
      subject: 'Mathematics',
      completedAt: new Date(Date.now() - 86400000),
    }
  );

  goals.push({
    _id: getNextId(),
    user: demoUserId,
    title: 'Complete Data Structures Core Syllabus',
    description: 'Master key data structures concepts and practice implementations.',
    category: 'Academic',
    priority: 'high',
    status: 'In Progress',
    startDate: new Date(),
    targetDate: new Date(Date.now() + 86400000 * 30),
    completedAt: null,
    milestones: [
      { _id: getNextId(), title: 'Arrays & Dynamic Arrays', completed: true, order: 0, completedAt: new Date() },
      { _id: getNextId(), title: 'Strings & Pattern Matching', completed: true, order: 1, completedAt: new Date() },
      { _id: getNextId(), title: 'Singly & Doubly Linked Lists', completed: false, order: 2 },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  savePersistentData();
}

const getMockContextData = (userId) => {
  return {
    tasks: tasks.filter((t) => t.user === userId),
    exams: exams.filter((e) => e.user === userId),
  };
};

const mockStore = {
  getMockContextData,
  getPlannerContextData: (userId) => {
    return {
      tasks: tasks.filter((t) => t.user === userId),
      exams: exams.filter((e) => e.user === userId),
      goals: goals.filter((g) => g.user === userId),
      notes: notes.filter((n) => n.user === userId),
      sessions: focusSessions.filter((s) => s.user === userId),
    };
  },
  getOrCreateConversation: (userId, convId, message) => {
    let conv = aiConversations.find((c) => c._id === convId && c.user === userId);
    if (!conv) {
      const cleanTitle = message.trim().replace(/[\r\n]+/g, ' ');
      const title = cleanTitle.length <= 50 ? cleanTitle : cleanTitle.slice(0, 47) + '...';
      conv = {
        _id: getNextId(),
        user: userId,
        title,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      aiConversations.unshift(conv);
    }
    conv.messages.push({ role: 'user', content: message.trim(), createdAt: new Date() });
    conv.updatedAt = new Date();
    savePersistentData();
    return { conversation: conv, history: conv.messages.slice(0, -1) };
  },
  saveMessage: (convId, role, content) => {
    const conv = aiConversations.find((c) => c._id === convId);
    if (conv) {
      conv.messages.push({ role, content, createdAt: new Date() });
      conv.updatedAt = new Date();
      savePersistentData();
    }
  },
  getUserConversations: (userId) => {
    return aiConversations
      .filter((c) => c.user === userId)
      .map((c) => ({ _id: c._id, title: c.title, updatedAt: c.updatedAt, createdAt: c.createdAt }))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },
  getConversationById: (userId, convId) => {
    return aiConversations.find((c) => c._id === convId && c.user === userId) || null;
  },
  deleteConversation: (userId, convId) => {
    aiConversations = aiConversations.filter((c) => !(c._id === convId && c.user === userId));
    savePersistentData();
  },
  getAnalyticsRawData: (userId) => {
    return {
      tasks: tasks.filter((t) => t.user === userId),
      exams: exams.filter((e) => e.user === userId),
      sessions: focusSessions.filter((s) => s.user === userId),
    };
  },
  logFocusSession: (userId, data) => {
    const session = {
      _id: getNextId(),
      user: userId,
      durationMinutes: data.durationMinutes || 25,
      actualDurationMinutes: data.actualDurationMinutes || data.durationMinutes || 25,
      mode: data.mode || 'work',
      subject: data.subject || 'General',
      title: data.title || data.subject || 'Focus Session',
      task: data.taskId || data.task || null,
      completionStatus: data.completionStatus || 'completed',
      accomplishment: data.accomplishment || '',
      completedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    focusSessions.unshift(session);
    savePersistentData();
    return session;
  },
  getGoals: (userId, filters = {}) => {
    let result = goals.filter((g) => g.user === userId);
    if (filters.status && filters.status !== 'all') {
      result = result.filter((g) => g.status === filters.status);
    }
    if (filters.priority && filters.priority !== 'all') {
      result = result.filter((g) => g.priority === filters.priority);
    }
    if (filters.category && filters.category !== 'all') {
      result = result.filter((g) => g.category === filters.category);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (g) => g.title.toLowerCase().includes(q) || (g.description && g.description.toLowerCase().includes(q))
      );
    }
    return result;
  },
  getGoalById: (userId, goalId) => {
    return goals.find((g) => g._id === goalId && g.user === userId) || null;
  },
  getGoalTasks: (userId, goalId) => {
    return tasks.filter((t) => t.user === userId && t.goal === goalId);
  },
  createGoal: (userId, data) => {
    const goal = {
      _id: getNextId(),
      user: userId,
      title: data.title,
      description: data.description || '',
      category: data.category || 'Academic',
      priority: data.priority || 'medium',
      status: 'In Progress',
      startDate: data.startDate || new Date(),
      targetDate: new Date(data.targetDate),
      completedAt: null,
      milestones: (data.milestones || []).map((m, idx) => ({
        _id: getNextId(),
        title: typeof m === 'string' ? m : m.title,
        description: m.description || '',
        completed: Boolean(m.completed),
        order: idx,
        completedAt: m.completed ? new Date() : null,
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    goals.unshift(goal);
    savePersistentData();
    return goal;
  },
  updateGoal: (userId, goalId, data) => {
    const goal = goals.find((g) => g._id === goalId && g.user === userId);
    if (!goal) return null;
    if (data.title) goal.title = data.title;
    if (data.description !== undefined) goal.description = data.description;
    if (data.category) goal.category = data.category;
    if (data.priority) goal.priority = data.priority;
    if (data.status) goal.status = data.status;
    if (data.startDate) goal.startDate = new Date(data.startDate);
    if (data.targetDate) goal.targetDate = new Date(data.targetDate);
    goal.updatedAt = new Date();
    savePersistentData();
    return goal;
  },
  deleteGoal: (userId, goalId) => {
    const idx = goals.findIndex((g) => g._id === goalId && g.user === userId);
    if (idx === -1) return false;
    goals.splice(idx, 1);
    savePersistentData();
    return true;
  },
  addMilestone: (userId, goalId, data) => {
    const goal = goals.find((g) => g._id === goalId && g.user === userId);
    if (!goal) return null;
    goal.milestones.push({
      _id: getNextId(),
      title: data.title,
      description: data.description || '',
      completed: false,
      order: goal.milestones.length,
    });
    goal.updatedAt = new Date();
    savePersistentData();
    return goal;
  },
  toggleMilestone: (userId, goalId, milestoneId) => {
    const goal = goals.find((g) => g._id === goalId && g.user === userId);
    if (!goal) return null;
    const milestone = goal.milestones.find((m) => m._id === milestoneId);
    if (!milestone) return null;
    milestone.completed = !milestone.completed;
    milestone.completedAt = milestone.completed ? new Date() : null;
    goal.updatedAt = new Date();
    savePersistentData();
    return goal;
  },
  deleteMilestone: (userId, goalId, milestoneId) => {
    const goal = goals.find((g) => g._id === goalId && g.user === userId);
    if (!goal) return null;
    goal.milestones = goal.milestones.filter((m) => m._id !== milestoneId);
    goal.updatedAt = new Date();
    savePersistentData();
    return goal;
  },
  getNotes: (userId, filters = {}) => {
    let result = notes.filter((n) => n.user === userId);
    if (filters.subject && filters.subject !== 'All') {
      result = result.filter((n) => n.subject === filters.subject);
    }
    if (filters.filter === 'pinned') {
      result = result.filter((n) => n.isPinned);
    } else if (filters.filter === 'important') {
      result = result.filter((n) => n.isImportant);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          (n.tags && n.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }
    result.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      if (filters.sort === 'createdAt') return new Date(b.createdAt) - new Date(a.createdAt);
      if (filters.sort === 'titleAsc') return a.title.localeCompare(b.title);
      if (filters.sort === 'titleDesc') return b.title.localeCompare(a.title);
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    return result;
  },
  getNoteById: (id, userId) => {
    return notes.find((n) => n._id === id && n.user === userId) || null;
  },
  createNote: (userId, data) => {
    const newNote = {
      _id: getNextId(),
      user: userId,
      title: data.title,
      content: data.content,
      subject: data.subject || 'General',
      tags: data.tags || [],
      isPinned: Boolean(data.isPinned),
      isImportant: Boolean(data.isImportant),
      color: data.color || '#6366f1',
      wordCount: data.wordCount || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    notes.unshift(newNote);
    savePersistentData();
    return newNote;
  },
  updateNote: (id, userId, data) => {
    const note = notes.find((n) => n._id === id && n.user === userId);
    if (!note) return null;
    if (data.title !== undefined) note.title = data.title;
    if (data.content !== undefined) note.content = data.content;
    if (data.subject !== undefined) note.subject = data.subject;
    if (data.tags !== undefined) note.tags = data.tags;
    if (data.isPinned !== undefined) note.isPinned = data.isPinned;
    if (data.isImportant !== undefined) note.isImportant = data.isImportant;
    if (data.color !== undefined) note.color = data.color;
    if (data.wordCount !== undefined) note.wordCount = data.wordCount;
    note.updatedAt = new Date();
    savePersistentData();
    return note;
  },
  deleteNote: (id, userId) => {
    const prevLength = notes.length;
    notes = notes.filter((n) => !(n._id === id && n.user === userId));
    savePersistentData();
    return notes.length < prevLength;
  },
  togglePinNote: (id, userId) => {
    const note = notes.find((n) => n._id === id && n.user === userId);
    if (!note) return null;
    note.isPinned = !note.isPinned;
    note.updatedAt = new Date();
    savePersistentData();
    return note;
  },
  toggleImportantNote: (id, userId) => {
    const note = notes.find((n) => n._id === id && n.user === userId);
    if (!note) return null;
    note.isImportant = !note.isImportant;
    note.updatedAt = new Date();
    savePersistentData();
    return note;
  },
};

// Middleware to mock protect route and decode token user ownership
const mockProtect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'super_secret_study_planner_jwt_token_key_2026_prod';
    const decoded = jwt.verify(token, secret);
    const foundUser = users.find((u) => u._id === decoded.id);
    req.user = foundUser || users[0];
    next();
  } catch (err) {
    req.user = users[0];
    next();
  }
};

const setupInMemoryServer = (app) => {
  console.log('🚀 Running Persistent API Server Mode...');

  // Auth Routes
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password, avatar, timezone } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists. Please sign in instead.' });
    }
    const newUser = {
      _id: getNextId(),
      name: name || 'Student',
      email: (email || '').trim(),
      passwordHash: password,
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      preferences: { dailyGoalMinutes: 120, subjects: ['Mathematics', 'Physics', 'Computer Science'] },
      reminderDaysBefore: 2,
      theme: 'dark',
      timezone: timezone || 'UTC',
    };
    users.push(newUser);

    // Seed starter tasks & exam for new user
    tasks.push(
      {
        _id: getNextId(),
        user: newUser._id,
        title: 'Complete Advanced Calculus Problem Set',
        description: 'Solve exercises 1 through 15 in Chapter 4.',
        subject: 'Mathematics',
        dueDate: new Date(Date.now() + 86400000 * 2),
        priority: 'high',
        status: 'in-progress',
        tags: ['Homework'],
        isRecurring: false,
        recurringInterval: 'none',
        estimatedMinutes: 90,
      },
      {
        _id: getNextId(),
        user: newUser._id,
        title: 'Review Data Structures & Algorithms Graphs Chapter',
        description: 'BFS, DFS, Dijkstra algorithms notes.',
        subject: 'Computer Science',
        dueDate: new Date(Date.now() + 86400000 * 4),
        priority: 'urgent',
        status: 'pending',
        tags: ['Exam Prep'],
        isRecurring: false,
        recurringInterval: 'none',
        estimatedMinutes: 120,
      }
    );

    exams.push({
      _id: getNextId(),
      user: newUser._id,
      subject: 'Computer Science Midterm',
      examDate: new Date(Date.now() + 86400000 * 5),
      examTime: '10:00 AM',
      venue: 'Auditorium Hall B',
      syllabusNotes: 'Data Structures, Trees, Graphs, Sorting Algorithms',
      linkedTasks: [],
      colorTag: '#6366f1',
    });

    savePersistentData();

    const token = generateToken(newUser._id);
    res.status(201).json({ success: true, data: { ...newUser, token } });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (user && user.passwordHash === password) {
      const token = generateToken(user._id);
      return res.json({ success: true, data: { ...user, token } });
    }
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out' });
  });

  app.get('/api/auth/me', mockProtect, (req, res) => {
    res.json({ success: true, data: req.user });
  });

  app.put('/api/auth/me', mockProtect, (req, res) => {
    Object.assign(req.user, req.body);
    savePersistentData();
    res.json({ success: true, data: req.user });
  });

  // Tasks Routes
  app.get('/api/tasks', mockProtect, (req, res) => {
    const { search, priority, status } = req.query;
    let result = tasks.filter((t) => t.user === req.user._id);
    if (search) {
      result = result.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
    }
    if (priority && priority !== 'All') {
      result = result.filter((t) => t.priority === priority);
    }
    if (status && status !== 'All') {
      result = result.filter((t) => t.status === status);
    }
    res.json({
      success: true,
      count: result.length,
      total: result.length,
      page: 1,
      pages: 1,
      data: result,
    });
  });

  app.post('/api/tasks', mockProtect, (req, res) => {
    const newTask = {
      _id: getNextId(),
      user: req.user._id,
      ...req.body,
      createdAt: new Date(),
    };
    tasks.unshift(newTask);
    savePersistentData();
    res.status(201).json({ success: true, data: newTask });
  });

  app.patch('/api/tasks/:id/status', mockProtect, (req, res) => {
    const task = tasks.find((t) => t._id === req.params.id);
    if (task) {
      task.status = req.body.status;
      if (req.body.status === 'completed') task.completedAt = new Date();
      savePersistentData();
      return res.json({ success: true, data: task });
    }
    res.status(404).json({ success: false, message: 'Task not found' });
  });

  app.delete('/api/tasks/:id', mockProtect, (req, res) => {
    tasks = tasks.filter((t) => t._id !== req.params.id);
    savePersistentData();
    res.json({ success: true, message: 'Task deleted' });
  });

  // Exams Routes
  app.get('/api/exams', mockProtect, (req, res) => {
    const userExams = exams.filter((e) => e.user === req.user._id);
    res.json({ success: true, count: userExams.length, data: userExams });
  });

  app.post('/api/exams', mockProtect, (req, res) => {
    const newExam = {
      _id: getNextId(),
      user: req.user._id,
      ...req.body,
      createdAt: new Date(),
    };
    exams.unshift(newExam);
    savePersistentData();
    res.status(201).json({ success: true, data: newExam });
  });

  app.delete('/api/exams/:id', mockProtect, (req, res) => {
    exams = exams.filter((e) => e._id !== req.params.id);
    savePersistentData();
    res.json({ success: true, message: 'Exam deleted' });
  });

  // Notifications Routes
  app.get('/api/notifications', mockProtect, (req, res) => {
    const userNotifs = notifications.filter((n) => n.user === req.user._id);
    const unreadCount = userNotifs.filter((n) => !n.isRead).length;
    res.json({ success: true, unreadCount, count: userNotifs.length, data: userNotifs });
  });

  app.patch('/api/notifications/read-all', mockProtect, (req, res) => {
    notifications.forEach((n) => {
      if (n.user === req.user._id) n.isRead = true;
    });
    savePersistentData();
    res.json({ success: true });
  });

  app.patch('/api/notifications/:id/read', mockProtect, (req, res) => {
    const notif = notifications.find((n) => n._id === req.params.id);
    if (notif) notif.isRead = true;
    savePersistentData();
    res.json({ success: true });
  });

  // Dashboard Stats Routes
  app.get('/api/dashboard/stats', mockProtect, (req, res) => {
    const userTasks = tasks.filter((t) => t.user === req.user._id);
    const totalTasks = userTasks.length;
    const completedTasks = userTasks.filter((t) => t.status === 'completed').length;
    const pendingTasks = userTasks.filter((t) => t.status !== 'completed').length;
    const overdueTasks = userTasks.filter((t) => t.status === 'overdue').length;

    const tasksBySubject = [
      { subject: 'Mathematics', total: 1, completed: 0 },
      { subject: 'Computer Science', total: 1, completed: 0 },
      { subject: 'Physics', total: 1, completed: 1 },
    ];

    res.json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        currentStreak: 3,
        upcomingExams: exams.filter((e) => e.user === req.user._id),
        tasksBySubject,
      },
    });
  });

  app.get('/api/dashboard/weekly', mockProtect, (req, res) => {
    const chartData = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return {
        date: d.toISOString().split('T')[0],
        completedCount: i % 3 === 0 ? 2 : i % 2 === 0 ? 1 : 0,
      };
    });
    res.json({ success: true, data: chartData });
  });

  // AI Assistant Routes
  app.post('/api/ai/chat', mockProtect, (req, res) => {
    chatWithAI(req, res, mockStore);
  });
  app.post('/api/ai/study-plan', mockProtect, (req, res) => {
    generateStudyPlanController(req, res, mockStore);
  });
  app.get('/api/ai/conversations', mockProtect, (req, res) => {
    getConversations(req, res, mockStore);
  });
  app.get('/api/ai/conversations/:id', mockProtect, (req, res) => {
    getConversationById(req, res, mockStore);
  });
  app.delete('/api/ai/conversations/:id', mockProtect, (req, res) => {
    deleteConversation(req, res, mockStore);
  });

  // Analytics Routes
  app.get('/api/analytics', mockProtect, (req, res) => {
    getAnalyticsData(req, res, mockStore);
  });
  app.post('/api/analytics/focus-session', mockProtect, (req, res) => {
    logFocusSession(req, res, mockStore);
  });

  // Goals & Milestones Routes
  app.get('/api/goals', mockProtect, (req, res) => {
    getGoals(req, res, mockStore);
  });
  app.post('/api/goals', mockProtect, (req, res) => {
    createGoal(req, res, mockStore);
  });
  app.get('/api/goals/:id', mockProtect, (req, res) => {
    getGoalById(req, res, mockStore);
  });
  app.put('/api/goals/:id', mockProtect, (req, res) => {
    updateGoal(req, res, mockStore);
  });
  app.delete('/api/goals/:id', mockProtect, (req, res) => {
    deleteGoal(req, res, mockStore);
  });
  app.post('/api/goals/:goalId/milestones', mockProtect, (req, res) => {
    addMilestone(req, res, mockStore);
  });
  app.patch('/api/goals/:goalId/milestones/:milestoneId/toggle', mockProtect, (req, res) => {
    toggleMilestone(req, res, mockStore);
  });
  app.delete('/api/goals/:goalId/milestones/:milestoneId', mockProtect, (req, res) => {
    deleteMilestone(req, res, mockStore);
  });

  // Calendar Routes
  app.get('/api/calendar', mockProtect, (req, res) => {
    getCalendarData(req, res, mockStore);
  });

  // Notes Routes
  app.get('/api/notes', mockProtect, (req, res) => {
    getNotes(req, res, mockStore);
  });
  app.post('/api/notes', mockProtect, (req, res) => {
    createNote(req, res, mockStore);
  });
  app.get('/api/notes/:id', mockProtect, (req, res) => {
    getNoteById(req, res, mockStore);
  });
  app.put('/api/notes/:id', mockProtect, (req, res) => {
    updateNote(req, res, mockStore);
  });
  app.delete('/api/notes/:id', mockProtect, (req, res) => {
    deleteNote(req, res, mockStore);
  });
  app.post('/api/notes/:id/ai', mockProtect, (req, res) => {
    processNoteAI(req, res, mockStore);
  });
  app.patch('/api/notes/:id/pin', mockProtect, (req, res) => {
    togglePinNote(req, res, mockStore);
  });

  app.patch('/api/notes/:id/important', mockProtect, (req, res) => {
    toggleImportantNote(req, res, mockStore);
  });
};

module.exports = { setupInMemoryServer, getMockContextData, mockStore, savePersistentData };
