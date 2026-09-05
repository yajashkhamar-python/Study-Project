const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: [true, 'Please specify the exam subject'],
      trim: true,
    },
    examDate: {
      type: Date,
      required: [true, 'Please specify the exam date'],
    },
    examTime: {
      type: String,
      default: '09:00 AM',
    },
    venue: {
      type: String,
      default: 'Main Hall / Online',
    },
    syllabusNotes: {
      type: String,
      default: '',
    },
    linkedTasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    colorTag: {
      type: String,
      default: '#6366f1',
    },
  },
  {
    timestamps: true,
  }
);

examSchema.index({ user: 1, examDate: 1 });

module.exports = mongoose.model('Exam', examSchema);
