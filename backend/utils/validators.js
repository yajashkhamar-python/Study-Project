const { check } = require('express-validator');

exports.registerValidation = [
  check('name', 'Name is required').not().isEmpty().trim(),
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
];

exports.loginValidation = [
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Password is required').exists(),
];

exports.updateProfileValidation = [
  check('name', 'Name cannot be empty if provided').optional().not().isEmpty().trim(),
  check('email', 'Please include a valid email').optional().isEmail().normalizeEmail(),
  check('reminderDaysBefore', 'Reminder days must be a positive integer').optional().isInt({ min: 1, max: 14 }),
  check('theme', 'Invalid theme mode').optional().isIn(['light', 'dark', 'system']),
];

exports.taskValidation = [
  check('title', 'Task title is required').not().isEmpty().trim(),
  check('subject', 'Subject is required').not().isEmpty().trim(),
  check('dueDate', 'Valid due date is required').isISO8601().toDate(),
  check('priority', 'Invalid priority level')
    .optional()
    .customSanitizer((val) => (typeof val === 'string' ? val.toLowerCase().trim() : val))
    .isIn(['low', 'medium', 'high', 'urgent']),
  check('status', 'Invalid status').optional().isIn(['pending', 'in-progress', 'completed', 'overdue']),
];

exports.examValidation = [
  check('subject', 'Subject is required').not().isEmpty().trim(),
  check('examDate', 'Valid exam date is required').isISO8601().toDate(),
];
