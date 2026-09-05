const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
    },
    subject: {
      type: String,
      default: 'General',
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isImportant: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    wordCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate word count before saving
noteSchema.pre('save', function (next) {
  if (this.content) {
    const text = this.content.replace(/<[^>]*>?/gm, '').trim();
    this.wordCount = text ? text.split(/\s+/).length : 0;
  } else {
    this.wordCount = 0;
  }
  next();
});

module.exports = mongoose.model('Note', noteSchema);
