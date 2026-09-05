const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all tasks with filtering, sorting, search, pagination
// @route   GET /api/tasks
// @access  Private
exports.getTasks = asyncHandler(async (req, res) => {
  const { search, subject, priority, status, sortBy, order, page = 1, limit = 50 } = req.query;

  // Build query
  const query = { user: req.user._id };

  // Search by title or description
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  if (subject && subject !== 'All') {
    query.subject = subject;
  }

  if (priority && priority !== 'All') {
    query.priority = priority;
  }

  if (status && status !== 'All') {
    query.status = status;
  }

  // Automatic overdue check update in background query if date < NOW and status != completed
  const now = new Date();
  await Task.updateMany(
    { user: req.user._id, status: { $ne: 'completed' }, dueDate: { $lt: now } },
    { $set: { status: 'overdue' } }
  );

  // Sorting
  let sortOptions = {};
  if (sortBy) {
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;
  } else {
    sortOptions = { dueDate: 1 };
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const tasks = await Task.find(query).sort(sortOptions).skip(skip).limit(limitNum);
  const total = await Task.countDocuments(query);

  res.json({
    success: true,
    count: tasks.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: tasks,
  });
});

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = asyncHandler(async (req, res) => {
  const { title, description, subject, dueDate, priority, status, tags, isRecurring, recurringInterval, estimatedMinutes } = req.body;

  const task = await Task.create({
    user: req.user._id,
    title,
    description,
    subject,
    dueDate,
    priority: priority || 'medium',
    status: status || 'pending',
    tags: tags || [],
    isRecurring: isRecurring || false,
    recurringInterval: recurringInterval || 'none',
    estimatedMinutes: estimatedMinutes || 60,
  });

  res.status(201).json({
    success: true,
    data: task,
  });
});

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  res.json({
    success: true,
    data: task,
  });
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = asyncHandler(async (req, res) => {
  let task = await Task.findOne({ _id: req.params.id, user: req.user._id });

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (req.body.status === 'completed' && task.status !== 'completed') {
    req.body.completedAt = new Date();
  }

  task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    data: task,
  });
});

// @desc    Update task status only
// @route   PATCH /api/tasks/:id/status
// @access  Private
exports.updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  let task = await Task.findOne({ _id: req.params.id, user: req.user._id });

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  task.status = status;
  if (status === 'completed') {
    task.completedAt = new Date();

    // Handle recurring task cloning if enabled
    if (task.isRecurring && task.recurringInterval !== 'none') {
      const nextDueDate = new Date(task.dueDate);
      if (task.recurringInterval === 'daily') nextDueDate.setDate(nextDueDate.getDate() + 1);
      if (task.recurringInterval === 'weekly') nextDueDate.setDate(nextDueDate.getDate() + 7);
      if (task.recurringInterval === 'monthly') nextDueDate.setMonth(nextDueDate.getMonth() + 1);

      await Task.create({
        user: task.user,
        title: task.title,
        description: task.description,
        subject: task.subject,
        dueDate: nextDueDate,
        priority: task.priority,
        status: 'pending',
        tags: task.tags,
        isRecurring: task.isRecurring,
        recurringInterval: task.recurringInterval,
        estimatedMinutes: task.estimatedMinutes,
      });
    }
  }

  await task.save();

  res.json({
    success: true,
    data: task,
  });
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  await task.deleteOne();

  res.json({
    success: true,
    message: 'Task removed',
  });
});

// @desc    Import multiple tasks
// @route   POST /api/tasks/import
// @access  Private
exports.importTasks = asyncHandler(async (req, res) => {
  const { tasks } = req.body;
  if (!Array.isArray(tasks) || tasks.length === 0) {
    res.status(400);
    throw new Error('Please provide an array of tasks to import');
  }

  const tasksToCreate = tasks.map((t) => ({
    ...t,
    user: req.user._id,
    dueDate: t.dueDate ? new Date(t.dueDate) : new Date(),
  }));

  const createdTasks = await Task.insertMany(tasksToCreate);

  res.status(201).json({
    success: true,
    count: createdTasks.length,
    data: createdTasks,
  });
});
