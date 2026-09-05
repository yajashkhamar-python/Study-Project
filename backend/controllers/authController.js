const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');
const bcrypt = require('bcryptjs');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, avatar, timezone } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const user = await User.create({
    name,
    email,
    passwordHash: password,
    avatar: avatar || undefined,
    timezone: timezone || 'UTC',
  });

  if (user) {
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
        reminderDaysBefore: user.reminderDaysBefore,
        theme: user.theme,
        timezone: user.timezone,
        token: generateToken(user._id),
      },
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');

  if (user && (await user.matchPassword(password))) {
    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
        reminderDaysBefore: user.reminderDaysBefore,
        theme: user.theme,
        timezone: user.timezone,
        token: generateToken(user._id),
      },
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Logout user / clear token client-side
// @route   POST /api/auth/logout
// @access  Private
exports.logoutUser = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
exports.getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      success: true,
      data: user,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile & preferences
// @route   PUT /api/auth/me
// @access  Private
exports.updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.avatar = req.body.avatar || user.avatar;
    user.reminderDaysBefore = req.body.reminderDaysBefore ?? user.reminderDaysBefore;
    user.theme = req.body.theme || user.theme;
    user.timezone = req.body.timezone || user.timezone;

    if (req.body.preferences) {
      user.preferences = {
        ...user.preferences,
        ...req.body.preferences,
      };
    }

    if (req.body.newPassword) {
      if (!req.body.currentPassword) {
        res.status(400);
        throw new Error('Current password is required to set new password');
      }
      const userWithPass = await User.findById(req.user._id).select('+passwordHash');
      const isMatch = await userWithPass.matchPassword(req.body.currentPassword);
      if (!isMatch) {
        res.status(400);
        throw new Error('Current password is incorrect');
      }
      user.passwordHash = req.body.newPassword;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        preferences: updatedUser.preferences,
        reminderDaysBefore: updatedUser.reminderDaysBefore,
        theme: updatedUser.theme,
        timezone: updatedUser.timezone,
        token: generateToken(updatedUser._id),
      },
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});
