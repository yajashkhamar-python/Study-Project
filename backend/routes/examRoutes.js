const express = require('express');
const router = express.Router();
const {
  getExams,
  createExam,
  getExamById,
  updateExam,
  deleteExam,
} = require('../controllers/examController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { examValidation } = require('../utils/validators');

router.use(protect);

router.route('/')
  .get(getExams)
  .post(examValidation, validate, createExam);

router.route('/:id')
  .get(getExamById)
  .put(updateExam)
  .delete(deleteExam);

module.exports = router;
