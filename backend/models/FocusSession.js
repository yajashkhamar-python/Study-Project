const mongoose = require('mongoose');

const focusSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: '',
    },
    durationMinutes: {
      type: Number,
      required: true,
      default: 25,
    },
    actualDurationMinutes: {
      type: Number,
      default: 25,
    },
    mode: {
      type: String,
      enum: ['work', 'break'],
      default: 'work',
    },
    subject: {
      type: String,
      default: 'General',
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    completionStatus: {
      type: String,
      enum: ['completed', 'partially_completed', 'not_completed', 'cancelled'],
      default: 'completed',
    },
    accomplishment: {
      type: String,
      default: '',
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

focusSessionSchema.index({ user: 1, completedAt: -1 });

module.exports = mongoose.model('FocusSession', focusSessionSchema);
