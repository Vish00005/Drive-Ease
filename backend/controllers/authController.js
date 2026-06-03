const { validationResult } = require('express-validator');
const User   = require('../models/User');
const Agency = require('../models/Agency');

/* ── Helper: send token response ── */
const sendToken = (user, statusCode, res) => {
  const token = user.getSignedJWT();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      location: user.location,
      avatar: user.avatar,
      agencyId: user.agencyId,
    },
  });
};

/* ── POST /api/auth/register ── */
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role = 'customer', location = '' } = req.body;

    // Check existing
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    let user = await User.create({ name, email, password, role, location });

    // If agency role → create Agency record
    if (role === 'agency') {
      const agency = await Agency.create({
        name: `${name}'s Agency`,
        ownerId: user._id,
        location,
        status: 'pending',
      });
      user.agencyId = agency._id;
      await user.save();
      await user.populate('agencyId');
    }

    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

/* ── POST /api/auth/login ── */
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password').populate('agencyId');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended' });
    }

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/auth/me ── */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('agencyId', 'name status logo location subscriptionPlan subscriptionStatus subscriptionExpiresAt updatedAt');
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

/* ── PUT /api/auth/updatepassword ── */
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/* ── PUT /api/auth/updateme ── */
exports.updateMe = async (req, res, next) => {
  try {
    const allowed = ['name', 'phone', 'location', 'bio'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true, runValidators: true,
    });

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

/* ── PUT /api/auth/avatar ── */
exports.updateAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;   // base64 data URL or external URL
    if (!avatar) {
      return res.status(400).json({ success: false, message: 'No avatar provided' });
    }

    // Limit base64 size (~1MB = ~1.37MB base64)
    if (avatar.startsWith('data:') && avatar.length > 1_400_000) {
      return res.status(413).json({ success: false, message: 'Image too large. Please use an image under 1MB.' });
    }

    const user = await User.findByIdAndUpdate(req.user.id, { avatar }, { new: true });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};
