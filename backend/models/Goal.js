const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['Academic', 'Programming', 'Career', 'Personal', 'Projects', 'Other'],
      default: 'Academic',
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed', 'Paused', 'Overdue'],
      default: 'Not Started',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    targetDate: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    milestones: [milestoneSchema],
  },
  {
    timestamps: true,
  }
);

goalSchema.index({ user: 1, targetDate: 1 });

module.exports = mongoose.model('Goal', goalSchema);
