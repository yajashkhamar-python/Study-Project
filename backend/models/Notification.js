const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['task_reminder', 'exam_reminder', 'overdue_alert', 'achievement', 'system'],
      default: 'task_reminder',
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    triggerAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ triggerAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
