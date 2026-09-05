const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a task title'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    subject: {
      type: String,
      required: [true, 'Please specify a subject'],
      default: 'General',
    },
    dueDate: {
      type: Date,
      required: [true, 'Please specify a due date'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'overdue'],
      default: 'pending',
    },
    tags: {
      type: [String],
      default: [],
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringInterval: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly'],
      default: 'none',
    },
    estimatedMinutes: {
      type: Number,
      default: 60,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    goal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      default: null,
    },
    milestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Task', taskSchema);
