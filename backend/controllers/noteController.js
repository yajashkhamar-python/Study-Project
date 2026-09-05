const mongoose = require('mongoose');
const Note = require('../models/Note');
const asyncHandler = require('../utils/asyncHandler');

// Helper to count words
const countWords = (text) => {
  if (!text) return 0;
  const clean = text.replace(/<[^>]*>?/gm, '').trim();
  return clean ? clean.split(/\s+/).length : 0;
};

// @desc    Get user notes with search, subject filter, status filter & sort
// @route   GET /api/notes
// @access  Private
const getNotes = asyncHandler(async (req, res, mockStore) => {
  const user = req.user;
  if (!user) return res.status(401).json({ success: false, message: 'Not authorized' });

  const isMongoDBConnected = mongoose.connection && mongoose.connection.readyState === 1;
  const { search, subject, filter, sort } = req.query;

  let notes = [];

  if (isMongoDBConnected) {
    const query = { user: user._id };

    if (subject && subject !== 'All') {
      query.subject = subject;
    }

    if (filter === 'pinned') {
      query.isPinned = true;
    } else if (filter === 'important') {
      query.isImportant = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    let sortOptions = { isPinned: -1, updatedAt: -1 };
    if (sort === 'createdAt') sortOptions = { isPinned: -1, createdAt: -1 };
    else if (sort === 'titleAsc') sortOptions = { isPinned: -1, title: 1 };
    else if (sort === 'titleDesc') sortOptions = { isPinned: -1, title: -1 };

    notes = await Note.find(query).sort(sortOptions).lean();
  } else if (mockStore && typeof mockStore.getNotes === 'function') {
    notes = mockStore.getNotes(user._id, { search, subject, filter, sort });
  }

  return res.json({
    success: true,
    count: notes.length,
    data: notes,
  });
});

// @desc    Get single note by ID
// @route   GET /api/notes/:id
// @access  Private
const getNoteById = asyncHandler(async (req, res, mockStore) => {
  const user = req.user;
  const { id } = req.params;

  const isMongoDBConnected = mongoose.connection && mongoose.connection.readyState === 1;

  let note = null;
  if (isMongoDBConnected) {
    note = await Note.findOne({ _id: id, user: user._id });
  } else if (mockStore && typeof mockStore.getNoteById === 'function') {
    note = mockStore.getNoteById(id, user._id);
  }

  if (!note) {
    return res.status(404).json({ success: false, message: 'Note not found' });
  }

  return res.json({ success: true, data: note });
});

// @desc    Create new note
// @route   POST /api/notes
// @access  Private
const createNote = asyncHandler(async (req, res, mockStore) => {
  const user = req.user;
  const { title, content, subject, tags, isPinned, isImportant, color } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required' });
  }

  const wordCount = countWords(content);
  const isMongoDBConnected = mongoose.connection && mongoose.connection.readyState === 1;

  let note = null;
  if (isMongoDBConnected) {
    note = await Note.create({
      user: user._id,
      title: title.trim(),
      content,
      subject: subject || 'General',
      tags: Array.isArray(tags) ? tags : [],
      isPinned: Boolean(isPinned),
      isImportant: Boolean(isImportant),
      color: color || '#6366f1',
      wordCount,
    });
  } else if (mockStore && typeof mockStore.createNote === 'function') {
    note = mockStore.createNote(user._id, {
      title,
      content,
      subject: subject || 'General',
      tags: Array.isArray(tags) ? tags : [],
      isPinned: Boolean(isPinned),
      isImportant: Boolean(isImportant),
      color: color || '#6366f1',
      wordCount,
    });
  }

  return res.status(201).json({ success: true, data: note });
});

// @desc    Update existing note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = asyncHandler(async (req, res, mockStore) => {
  const user = req.user;
  const { id } = req.params;
  const { title, content, subject, tags, isPinned, isImportant, color } = req.body;

  const isMongoDBConnected = mongoose.connection && mongoose.connection.readyState === 1;

  let updated = null;
  if (isMongoDBConnected) {
    const note = await Note.findOne({ _id: id, user: user._id });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    if (title !== undefined) note.title = title.trim();
    if (content !== undefined) {
      note.content = content;
      note.wordCount = countWords(content);
    }
    if (subject !== undefined) note.subject = subject;
    if (tags !== undefined) note.tags = Array.isArray(tags) ? tags : [];
    if (isPinned !== undefined) note.isPinned = Boolean(isPinned);
    if (isImportant !== undefined) note.isImportant = Boolean(isImportant);
    if (color !== undefined) note.color = color;

    updated = await note.save();
  } else if (mockStore && typeof mockStore.updateNote === 'function') {
    updated = mockStore.updateNote(id, user._id, {
      title,
      content,
      subject,
      tags,
      isPinned,
      isImportant,
      color,
      wordCount: content !== undefined ? countWords(content) : undefined,
    });
  }

  if (!updated) return res.status(404).json({ success: false, message: 'Note not found' });

  return res.json({ success: true, data: updated });
});

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = asyncHandler(async (req, res, mockStore) => {
  const user = req.user;
  const { id } = req.params;

  const isMongoDBConnected = mongoose.connection && mongoose.connection.readyState === 1;

  let success = false;
  if (isMongoDBConnected) {
    const note = await Note.findOne({ _id: id, user: user._id });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    await note.deleteOne();
    success = true;
  } else if (mockStore && typeof mockStore.deleteNote === 'function') {
    success = mockStore.deleteNote(id, user._id);
  }

  if (!success) return res.status(404).json({ success: false, message: 'Note not found' });

  return res.json({ success: true, message: 'Note deleted successfully' });
});

// @desc    Toggle pin status of note
// @route   PATCH /api/notes/:id/pin
// @access  Private
const togglePinNote = asyncHandler(async (req, res, mockStore) => {
  const user = req.user;
  const { id } = req.params;

  const isMongoDBConnected = mongoose.connection && mongoose.connection.readyState === 1;

  let updated = null;
  if (isMongoDBConnected) {
    const note = await Note.findOne({ _id: id, user: user._id });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    note.isPinned = !note.isPinned;
    updated = await note.save();
  } else if (mockStore && typeof mockStore.togglePinNote === 'function') {
    updated = mockStore.togglePinNote(id, user._id);
  }

  if (!updated) return res.status(404).json({ success: false, message: 'Note not found' });

  return res.json({ success: true, data: updated });
});

// @desc    Toggle important status of note
// @route   PATCH /api/notes/:id/important
// @access  Private
const toggleImportantNote = asyncHandler(async (req, res, mockStore) => {
  const user = req.user;
  const { id } = req.params;

  const isMongoDBConnected = mongoose.connection && mongoose.connection.readyState === 1;

  let updated = null;
  if (isMongoDBConnected) {
    const note = await Note.findOne({ _id: id, user: user._id });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    note.isImportant = !note.isImportant;
    updated = await note.save();
  } else if (mockStore && typeof mockStore.toggleImportantNote === 'function') {
    updated = mockStore.toggleImportantNote(id, user._id);
  }

  if (!updated) return res.status(404).json({ success: false, message: 'Note not found' });

  return res.json({ success: true, data: updated });
});

const { generateNoteAIResponse } = require('../services/aiService');

// @desc    Process AI action for a note (summarize, explain, quiz, flashcards)
// @route   POST /api/notes/:id/ai
// @access  Private
const processNoteAI = asyncHandler(async (req, res, mockStore) => {
  const user = req.user;
  const { id } = req.params;
  const { action = 'summarize' } = req.body;

  const validActions = ['summarize', 'explain', 'quiz', 'flashcards'];
  if (!validActions.includes(action)) {
    return res.status(400).json({ success: false, message: 'Invalid AI action specified' });
  }

  const isMongoDBConnected = mongoose.connection && mongoose.connection.readyState === 1;

  let note = null;
  if (isMongoDBConnected) {
    note = await Note.findOne({ _id: id, user: user._id }).lean();
  } else if (mockStore && typeof mockStore.getNoteById === 'function') {
    note = mockStore.getNoteById(id, user._id);
  }

  if (!note) {
    return res.status(404).json({ success: false, message: 'Note not found or access denied' });
  }

  // Handle character limit safety (> 12,000 characters truncated)
  let content = note.content || '';
  let truncated = false;
  if (content.length > 12000) {
    content = content.slice(0, 12000);
    truncated = true;
  }

  const notePayload = {
    title: note.title,
    subject: note.subject,
    content,
  };

  const result = await generateNoteAIResponse(notePayload, action);

  return res.json({
    success: true,
    action,
    result,
    truncated,
  });
});

module.exports = {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  togglePinNote,
  toggleImportantNote,
  processNoteAI,
};

