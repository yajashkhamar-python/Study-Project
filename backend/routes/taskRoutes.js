const express = require('express');
const router = express.Router();
const {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  importTasks,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { taskValidation } = require('../utils/validators');

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(taskValidation, validate, createTask);

router.post('/import', importTasks);

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

router.patch('/:id/status', updateTaskStatus);

module.exports = router;
