const Exam = require('../models/Exam');
const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all exams for user
// @route   GET /api/exams
// @access  Private
exports.getExams = asyncHandler(async (req, res) => {
  const exams = await Exam.find({ user: req.user._id })
    .populate('linkedTasks', 'title dueDate status priority')
    .sort({ examDate: 1 });

  res.json({
    success: true,
    count: exams.length,
    data: exams,
  });
});

// @desc    Create new exam
// @route   POST /api/exams
// @access  Private
exports.createExam = asyncHandler(async (req, res) => {
  const { subject, examDate, examTime, venue, syllabusNotes, linkedTasks, colorTag } = req.body;

  const exam = await Exam.create({
    user: req.user._id,
    subject,
    examDate,
    examTime: examTime || '09:00 AM',
    venue: venue || 'Main Campus',
    syllabusNotes: syllabusNotes || '',
    linkedTasks: linkedTasks || [],
    colorTag: colorTag || '#6366f1',
  });

  const populatedExam = await Exam.findById(exam._id).populate('linkedTasks', 'title dueDate status priority');

  res.status(201).json({
    success: true,
    data: populatedExam,
  });
});

// @desc    Get exam by ID
// @route   GET /api/exams/:id
// @access  Private
exports.getExamById = asyncHandler(async (req, res) => {
  const exam = await Exam.findOne({ _id: req.params.id, user: req.user._id })
    .populate('linkedTasks', 'title dueDate status priority');

  if (!exam) {
    res.status(404);
    throw new Error('Exam not found');
  }

  res.json({
    success: true,
    data: exam,
  });
});

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private
exports.updateExam = asyncHandler(async (req, res) => {
  let exam = await Exam.findOne({ _id: req.params.id, user: req.user._id });

  if (!exam) {
    res.status(404);
    throw new Error('Exam not found');
  }

  exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('linkedTasks', 'title dueDate status priority');

  res.json({
    success: true,
    data: exam,
  });
});

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private
exports.deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findOne({ _id: req.params.id, user: req.user._id });

  if (!exam) {
    res.status(404);
    throw new Error('Exam not found');
  }

  await exam.deleteOne();

  res.json({
    success: true,
    message: 'Exam deleted successfully',
  });
});
