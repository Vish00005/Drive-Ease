const Agency  = require('../models/Agency');
const Vehicle = require('../models/Vehicle');

/* ── GET /api/agencies ── (Admin) */
exports.getAgencies = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name:     { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Agency.countDocuments(query);
    const agencies = await Agency.find(query)
      .populate('ownerId', 'name email phone')
      .populate('fleetCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, count: agencies.length, total, pages: Math.ceil(total / limit), data: agencies });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/agencies/:id ── (Public) */
exports.getAgency = async (req, res, next) => {
  try {
    const agency = await Agency.findById(req.params.id)
      .populate('ownerId', 'name email phone')
      .populate('fleetCount');

    if (!agency) return res.status(404).json({ success: false, message: 'Agency not found' });

    // Fetch agency vehicles
    const vehicles = await Vehicle.find({ agencyId: req.params.id, available: true }).limit(6);

    res.json({ success: true, data: { ...agency.toObject(), vehicles } });
  } catch (err) {
    next(err);
  }
};

/* ── PATCH /api/agencies/:id/status ── (Admin) */
exports.updateAgencyStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'suspended', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const agency = await Agency.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!agency) return res.status(404).json({ success: false, message: 'Agency not found' });

    res.json({ success: true, data: agency });
  } catch (err) {
    next(err);
  }
};

/* ── PUT /api/agencies/profile ── (Agency — update own profile) */
exports.updateAgencyProfile = async (req, res, next) => {
  try {
    const { name, description, phone, email, location, logo } = req.body;

    const agency = await Agency.findByIdAndUpdate(
      req.user.agencyId,
      { name, description, phone, email, location, logo },
      { new: true, runValidators: true }
    );

    if (!agency) return res.status(404).json({ success: false, message: 'Agency not found' });

    res.json({ success: true, data: agency });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/agencies/dashboard/stats ── (Agency) */
exports.getAgencyStats = async (req, res, next) => {
  try {
    const agencyId = req.user.agencyId;
    const [fleetTotal, fleetAvailable, bookingStats] = await Promise.all([
      Vehicle.countDocuments({ agencyId }),
      Vehicle.countDocuments({ agencyId, available: true }),
      require('../models/Booking').aggregate([
        { $match: { agencyId: new (require('mongoose').Types.ObjectId)(agencyId) } },
        { $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
        }},
      ]),
    ]);

    const totalRevenue = bookingStats
      .filter(s => ['confirmed', 'active', 'completed'].includes(s._id))
      .reduce((sum, s) => sum + s.revenue, 0);

    const pendingCount = (bookingStats.find(s => s._id === 'pending') || {}).count || 0;

    res.json({
      success: true,
      data: { fleetTotal, fleetAvailable, totalRevenue, pendingCount, bookingStats },
    });
  } catch (err) {
    next(err);
  }
};

/* ── POST /api/agencies/subscribe ── (Agency) */
exports.subscribeToPlan = async (req, res, next) => {
  try {
    const { plan } = req.body;
    if (!['starter', 'growth', 'enterprise'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid subscription plan.' });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days plan duration

    const agency = await Agency.findByIdAndUpdate(
      req.user.agencyId,
      {
        subscriptionPlan: plan,
        subscriptionStatus: 'active',
        subscriptionExpiresAt: expiresAt,
      },
      { new: true }
    );

    if (!agency) return res.status(404).json({ success: false, message: 'Agency not found' });

    res.json({ success: true, data: agency });
  } catch (err) {
    next(err);
  }
};

