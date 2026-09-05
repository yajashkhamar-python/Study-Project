const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  addMilestone,
  toggleMilestone,
  deleteMilestone,
} = require('../controllers/goalController');

router.use(protect);

router.route('/')
  .get((req, res) => getGoals(req, res))
  .post((req, res) => createGoal(req, res));

router.route('/:id')
  .get((req, res) => getGoalById(req, res))
  .put((req, res) => updateGoal(req, res))
  .delete((req, res) => deleteGoal(req, res));

router.route('/:goalId/milestones')
  .post((req, res) => addMilestone(req, res));

router.route('/:goalId/milestones/:milestoneId/toggle')
  .patch((req, res) => toggleMilestone(req, res));

router.route('/:goalId/milestones/:milestoneId')
  .delete((req, res) => deleteMilestone(req, res));

module.exports = router;
