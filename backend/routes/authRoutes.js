const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
} = require('../utils/validators');

router.post('/register', registerValidation, validate, registerUser);
router.post('/login', loginValidation, validate, loginUser);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getUserProfile);
router.put('/me', protect, updateProfileValidation, validate, updateUserProfile);

module.exports = router;
