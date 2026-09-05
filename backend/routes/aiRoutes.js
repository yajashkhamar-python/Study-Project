const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  chatWithAI,
  getConversations,
  getConversationById,
  deleteConversation,
  generateStudyPlanController,
} = require('../controllers/aiController');

// @route   POST /api/ai/chat
// @desc    Send prompt to StudyPulse AI
// @access  Private
router.post('/chat', protect, (req, res) => chatWithAI(req, res));

// @route   POST /api/ai/study-plan
// @desc    Generate personalized AI Study Plan
// @access  Private
router.post('/study-plan', protect, (req, res) => generateStudyPlanController(req, res));

// @route   GET /api/ai/conversations
// @desc    Get user's saved AI conversations list
// @access  Private
router.get('/conversations', protect, (req, res) => getConversations(req, res));

// @route   GET /api/ai/conversations/:id
// @desc    Get single AI conversation with messages
// @access  Private
router.get('/conversations/:id', protect, (req, res) => getConversationById(req, res));

// @route   DELETE /api/ai/conversations/:id
// @desc    Delete an AI conversation
// @access  Private
router.delete('/conversations/:id', protect, (req, res) => deleteConversation(req, res));

module.exports = router;

