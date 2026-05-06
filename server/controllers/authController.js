const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, designation } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // First user becomes admin automatically
    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;

    const user = await User.create({
      name,
      email,
      password,
      role: isFirstUser ? 'admin' : (role || 'staff'),
      designation: isFirstUser ? 'Admin' : (designation || 'CISF'),
      isApproved: isFirstUser, // First user auto-approved as admin
    });

    res.status(201).json({
      success: true,
      message: isFirstUser
        ? 'Admin account created and approved.'
        : 'Registration successful. Awaiting admin approval.',
      isApproved: user.isApproved,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Account pending admin approval.',
      });
    }

    const token = signToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        designation: user.designation,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/pending-users (admin)
exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ isApproved: false }).select('-password').sort('-createdAt');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/auth/approve-user/:id (admin)
exports.approveUser = async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (action === 'reject') {
      await User.findByIdAndDelete(req.params.id);
      return res.json({ success: true, message: 'User rejected and removed' });
    }

    user.isApproved = true;
    await user.save();

    res.json({ success: true, message: 'User approved successfully', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/user/:id (any approved user)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/all-users (admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isApproved: true }).select('-password').sort('-createdAt');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
