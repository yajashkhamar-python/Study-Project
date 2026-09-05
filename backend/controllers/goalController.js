const mongoose = require('mongoose');
const Goal = require('../models/Goal');
const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');

// Helper function to derive progress percentage and auto-status
const processGoalStatusAndProgress = (goalObj) => {
  const milestones = goalObj.milestones || [];
  const total = milestones.length;
  const completedCount = milestones.filter((m) => m.completed).length;
  const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  let status = goalObj.status || 'Not Started';
  let completedAt = goalObj.completedAt;

  // Auto-status transition logic (unless manually Paused)
  if (status !== 'Paused') {
    const isPastTarget = goalObj.targetDate && new Date(goalObj.targetDate) < new Date();

    if (total > 0 && completedCount === total) {
      status = 'Completed';
      if (!completedAt) completedAt = new Date();
    } else if (isPastTarget) {
      status = 'Overdue';
      completedAt = null;
    } else if (completedCount > 0) {
      status = 'In Progress';
      completedAt = null;
    } else {
      status = 'Not Started';
      completedAt = null;
    }
  }

  return {
    ...goalObj,
    progress,
    completedMilestones: completedCount,
    totalMilestones: total,
    status,
    completedAt,
  };
};

// @desc    Get all goals for logged-in user
// @route   GET /api/goals
// @access  Private
const getGoals = asyncHandler(async (req, res, mockStore) => {
  const user = req.user;
  if (!user) return res.status(401).json({ success: false, message: 'Not authorized' });

  const { search, status, priority, category, sortBy = 'deadline' } = req.query;

  const isMongoDBConnected = mongoose.connection && mongoose.connection.readyState === 1;
  let rawGoals = [];

  if (isMongoDBConnected) {
    let query = { user: user._id };

    if (status && status !== 'all') {
      query.status = status;
    }
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    if (category && category !== 'all') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    rawGoals = await Goal.find(query).lean();
  } else if (mockStore && typeof mockStore.getGoals === 'function') {
    rawGoals = mockStore.getGoals(user._id, { search, status, priority, category });
  }

  // Process status and progress dynamically
  let goals = rawGoals.map((g) => processGoalStatusAndProgress(g));

  // Client-requested sorting
  if (sortBy === 'deadline') {
    goals.sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate));
  } else if (sortBy === 'priority') {
    const pRank = { high: 1, medium: 2, low: 3 };
    goals.sort((a, b) => (pRank[a.priority] || 4) - (pRank[b.priority] || 4));
  } else if (sortBy === 'progress') {
    goals.sort((a, b) => b.progress - a.progress);
  } else if (sortBy === 'recent') {
    goals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return res.json({ success: true, count: goals.length, data: goals });
});

// @desc    Get single goal by ID with optional linked tasks
// @route   GET /api/goals/:id
// @access  Private
const getGoalById = asyncHandler(async (req, res, mockStore) => {
  const user = req.user;
  if (!user) return res.status(401).json({ success: false, message: 'Not authorized' });

  const { id } = req.params;
  const isMongoDBConnected = mongoose.connection && mongoose.connection.readyState === 1;

  let rawGoal = null;
  let linkedTasks = [];

  if (isMongoDBConnected) {
    rawGoal = await Goal.findOne({ _id: id, user: user._id }).lean();
    if (rawGoal) {
      linkedTasks = await Task.find({ user: user._id, goal: id }).lean();
    }
  } else if (mockStore && typeof mockStore.getGoalById === 'function') {
    rawGoal = mockStore.getGoalById(user._id, id);
    if (rawGoal && typeof mockStore.getGoalTasks === 'function') {
      linkedTasks = mockStore.getGoalTasks(user._id, id);
    }
  }

  if (!rawGoal) {
    return res.status(404).json({ success: false, message: 'Goal not found' });
  }

  const processedGoal = processGoalStatusAndProgress(rawGoal);
  processedGoal.linkedTasks = linkedTasks;

  return res.json({ success: true, data: processedGoal });
});

// @desc    Create a new goal with optional milestones
// @route   POST /api/goals
// @access  Private
const createGoal = asyncHandler(async (req, res, mockStore) => {
  const user = req.user;
  if (!user) return res.status(401).json({ success: false, message: 'Not authorized' });

  const { title, description, category, priority, startDate, targetDate, milestones = [] } = req.body;

  if (!title || !targetDate) {
    return res.status(400).json({ success: false, message: 'Title and Target Date are required' });
  }

  const formattedMilestones = milestones.map((m, idx) => ({
    title: typeof m === 'string' ? m : m.title,
    description: m.description || '',
    completed: Boolean(m.completed),
    order: idx,
    completedAt: m.completed ? new Date() : null,
  }));

  const isMongoDBConnected = mongoose.connection && mongoose.connection.readyState === 1;

  if (isMongoDBConnected) {
    const goal = await Goal.create({
      user: user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      category: category || 'Academic',
      priority: priority || 'medium',
      startDate: startDate || new Date(),
      targetDate: new Date(targetDate),
      milestones: formattedMilestones,
    });

    const processed = processGoalStatusAndProgress(goal.toObject());
    return res.status(201).json({ success: true, data: processed });
  } else if (mockStore && typeof mockStore.createGoal === 'function') {
    const goal = mockStore.createGoal(user._id, {
      title,
      description,
      category,
      priority,
      startDate,
      targetDate,
      milestones: formattedMilestones,
    });
    const processed = processGoalStatusAndProgress(goal);
    return res.status(201).json({ success: true, data: processed });
  }

  return res.status(500).json({ success: false, message: 'Unable to create goal' });
});

// @desc    Update goal details
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = asyncHandler(async (req, res, mockStore) => {
  const user = req.user;
  if (!user) return res.status(401).json({ success: false, message: 'Not authorized' });

  const { id } = req.params;
  const { title, description, category, priority, status, startDate, targetDate } = req.body;

  const isMongoDBConnected = mongoose.connection && mongoose.connection.readyState === 1;

  if (isMongoDBConnected) {
    const goal = await Goal.findOne({ _id: id, user: user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    if (title) goal.title = title.trim();
    if (description !== undefined) goal.description = description.trim();
    if (category) goal.category = category;
    if (priority) goal.priority = priority;
    if (status) goal.status = status;
    if (startDate) goal.startDate = new Date(startDate);
    if (targetDate) goal.targetDate = new Date(targetDate);

    await goal.save();
    const processed = processGoalStatusAndProgress(goal.toObject());
    return res.json({ success: true, data: processed });
  } else if (mockStore && typeof mockStore.updateGoal === 'function') {
    const updated = mockStore.updateGoal(user._id, id, {
      title,
      description,
      category,
      priority,
      status,
      startDate,
      targetDate,
    });
    if (!updated) return res.status(404).json({ success: false, message: 'Goal not found' });
    const processed = processGoalStatusAndProgress(updated);
    return res.json({ success: true, data: processed });
  }

  return res.status(500).json({ success: false, message: 'Unable to update goal' });
});

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = asyncHandler(async (req, res, mockStore) => {
  const user = req.user;
  if (!user) return res.status(401).json({ success: false, message: 'Not authorized' });

  const { id } = req.params;
  const isMongoDBConnected = mongoose.connection && mongoose.connection.readyState === 1;

  if (isMongoDBConnected) {
    const result = await Goal.deleteOne({ _id: id, user: user._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }
    // Unlink tasks
    await Task.updateMany({ user: user._id, goal: id }, { $set: { goal: null, milestoneId: null } });
    return res.json({ success: true, message: 'Goal deleted successfully' });
  } else if (mockStore && typeof mockStore.deleteGoal === 'function') {
    const ok = mockStore.deleteGoal(user._id, id);
    if (!ok) return res.status(404).json({ success: false, message: 'Goal not found' });
    return res.json({ success: true, message: 'Goal deleted successfully' });
  }

  return res.status(500).json({ success: false, message: 'Unable to delete goal' });
});

// @desc    Add milestone to goal
// @route   POST /api/goals/:goalId/milestones
// @access  Private
const addMilestone = asyncHandler(async (req, res, mockStore) => {
  const user = req.user;
  if (!user) return res.status(401).json({ success: false, message: 'Not authorized' });

  const { goalId } = req.params;
  const { title, description } = req.body;

  if (!title) return res.status(400).json({ success: false, message: 'Milestone title is required' });

  const isMongoDBConnected = mongoose.connection && mongoose.connection.readyState === 1;

  if (isMongoDBConnected) {
    const goal = await Goal.findOne({ _id: goalId, user: user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    goal.milestones.push({
      title: title.trim(),
      description: description ? description.trim() : '',
      completed: false,
      order: goal.milestones.length,
    });

    await goal.save();
    const processed = processGoalStatusAndProgress(goal.toObject());
    return res.status(201).json({ success: true, data: processed });
  } else if (mockStore && typeof mockStore.addMilestone === 'function') {
    const goal = mockStore.addMilestone(user._id, goalId, { title, description });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    const processed = processGoalStatusAndProgress(goal);
    return res.status(201).json({ success: true, data: processed });
  }

  return res.status(500).json({ success: false, message: 'Unable to add milestone' });
});

// @desc    Toggle milestone completion
// @route   PATCH /api/goals/:goalId/milestones/:milestoneId/toggle
// @access  Private
const toggleMilestone = asyncHandler(async (req, res, mockStore) => {
  const user = req.user;
  if (!user) return res.status(401).json({ success: false, message: 'Not authorized' });

  const { goalId, milestoneId } = req.params;
  const isMongoDBConnected = mongoose.connection && mongoose.connection.readyState === 1;

  if (isMongoDBConnected) {
    const goal = await Goal.findOne({ _id: goalId, user: user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    const milestone = goal.milestones.id(milestoneId);
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

    milestone.completed = !milestone.completed;
    milestone.completedAt = milestone.completed ? new Date() : null;

    // Check auto completion status
    const allCompleted = goal.milestones.length > 0 && goal.milestones.every((m) => m.completed);
    if (allCompleted) {
      goal.status = 'Completed';
      goal.completedAt = new Date();
    } else if (goal.status === 'Completed' && !allCompleted) {
      goal.status = 'In Progress';
      goal.completedAt = null;
    }

    await goal.save();
    const processed = processGoalStatusAndProgress(goal.toObject());
    return res.json({ success: true, data: processed, milestoneToggled: milestone });
  } else if (mockStore && typeof mockStore.toggleMilestone === 'function') {
    const goal = mockStore.toggleMilestone(user._id, goalId, milestoneId);
    if (!goal) return res.status(404).json({ success: false, message: 'Goal or Milestone not found' });
    const processed = processGoalStatusAndProgress(goal);
    return res.json({ success: true, data: processed });
  }

  return res.status(500).json({ success: false, message: 'Unable to toggle milestone' });
});

// @desc    Delete milestone from goal
// @route   DELETE /api/goals/:goalId/milestones/:milestoneId
// @access  Private
const deleteMilestone = asyncHandler(async (req, res, mockStore) => {
  const user = req.user;
  if (!user) return res.status(401).json({ success: false, message: 'Not authorized' });

  const { goalId, milestoneId } = req.params;
  const isMongoDBConnected = mongoose.connection && mongoose.connection.readyState === 1;

  if (isMongoDBConnected) {
    const goal = await Goal.findOne({ _id: goalId, user: user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    goal.milestones = goal.milestones.filter((m) => m._id.toString() !== milestoneId);
    await goal.save();

    const processed = processGoalStatusAndProgress(goal.toObject());
    return res.json({ success: true, data: processed });
  } else if (mockStore && typeof mockStore.deleteMilestone === 'function') {
    const goal = mockStore.deleteMilestone(user._id, goalId, milestoneId);
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    const processed = processGoalStatusAndProgress(goal);
    return res.json({ success: true, data: processed });
  }

  return res.status(500).json({ success: false, message: 'Unable to delete milestone' });
});

module.exports = {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  addMilestone,
  toggleMilestone,
  deleteMilestone,
};
