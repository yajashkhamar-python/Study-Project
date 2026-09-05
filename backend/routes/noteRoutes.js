const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  togglePinNote,
  toggleImportantNote,
  processNoteAI,
} = require('../controllers/noteController');

router.use(protect);

router.route('/')
  .get((req, res) => getNotes(req, res))
  .post((req, res) => createNote(req, res));

router.route('/:id')
  .get((req, res) => getNoteById(req, res))
  .put((req, res) => updateNote(req, res))
  .delete((req, res) => deleteNote(req, res));

router.post('/:id/ai', (req, res) => processNoteAI(req, res));
router.patch('/:id/pin', (req, res) => togglePinNote(req, res));
router.patch('/:id/important', (req, res) => toggleImportantNote(req, res));

module.exports = router;

