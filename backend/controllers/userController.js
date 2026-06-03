const User = require('../models/User');

/* ── GET /api/users ── (Admin) */
exports.getUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role)   query.role   = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .populate('agencyId', 'name status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, count: users.length, total, pages: Math.ceil(total / limit), data: users });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/users/:id ── (Admin) */
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('agencyId', 'name location logo');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

/* ── PATCH /api/users/:id/status ── (Admin) */
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/users/stats ── (Admin) */
exports.getUserStats = async (req, res, next) => {
  try {
    const stats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);
    const total     = await User.countDocuments();
    const suspended = await User.countDocuments({ status: 'suspended' });
    res.json({ success: true, data: { stats, total, suspended } });
  } catch (err) {
    next(err);
  }
};
