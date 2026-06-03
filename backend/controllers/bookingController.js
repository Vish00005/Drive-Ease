const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const User    = require('../models/User');

/* helpers */
const calcDurationType = (days) => {
  if (days >= 28) return 'monthly';
  if (days >= 7)  return 'weekly';
  return 'daily';
};

const calcPrice = (vehicle, days) => {
  const type = calcDurationType(days);
  if (type === 'monthly') {
    const months = Math.ceil(days / 28);
    return { price: vehicle.price.monthly * months, type };
  }
  if (type === 'weekly') {
    const weeks = Math.ceil(days / 7);
    return { price: vehicle.price.weekly * weeks, type };
  }
  return { price: vehicle.price.daily * days, type };
};

/* ── POST /api/bookings ── (Customer) */
exports.createBooking = async (req, res, next) => {
  try {
    const { vehicleId, startDate, endDate, pickupLocation, notes } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    if (!vehicle.available) {
      return res.status(400).json({ success: false, message: 'Vehicle is not available' });
    }

    const start = new Date(startDate);
    const end   = new Date(endDate);
    const days  = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (days < 1) {
      return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }

    // Overlap check — no confirmed/active/pending bookings for same vehicle overlapping dates
    const overlap = await Booking.findOne({
      vehicleId,
      status: { $in: ['pending', 'confirmed', 'active'] },
      $or: [
        { startDate: { $lt: end }, endDate: { $gt: start } },
      ],
    });
    if (overlap) {
      return res.status(409).json({ success: false, message: 'Vehicle is already booked for these dates' });
    }

    const { price, type } = calcPrice(vehicle, days);

    const booking = await Booking.create({
      vehicleId,
      customerId: req.user.id,
      agencyId: vehicle.agencyId,
      startDate: start,
      endDate: end,
      days,
      durationType: type,
      totalPrice: price,
      pickupLocation: pickupLocation || vehicle.location,
      vehicleName: vehicle.name,
      customerName: req.user.name,
      notes: notes || '',
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/bookings/my ── (Customer) */
exports.getMyBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { customerId: req.user.id };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('vehicleId', 'name brand images type price')
      .populate('agencyId', 'name location phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/bookings/agency ── (Agency) */
exports.getAgencyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { agencyId: req.user.agencyId };
    if (status) query.status = status;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('vehicleId', 'name brand images type')
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: bookings.length,
      total,
      pages: Math.ceil(total / limit),
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/bookings ── (Admin — all) */
exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('vehicleId', 'name brand type images')
      .populate('customerId', 'name email')
      .populate('agencyId', 'name location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, count: bookings.length, total, pages: Math.ceil(total / limit), data: bookings });
  } catch (err) {
    next(err);
  }
};

/* ── PATCH /api/bookings/:id/status ── (Agency / Admin) */
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const VALID = ['confirmed', 'rejected', 'active', 'completed', 'cancelled'];

    if (!VALID.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Agency can only update their own bookings
    if (req.user.role === 'agency' && booking.agencyId.toString() !== req.user.agencyId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    booking.status = status;
    if (rejectionReason) booking.rejectionReason = rejectionReason;
    await booking.save();

    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

/* ── DELETE /api/bookings/:id ── (Customer — cancel pending only) */
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.customerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Can only cancel pending or confirmed bookings' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/bookings/stats ── (Admin dashboard) */
exports.getStats = async (req, res, next) => {
  try {
    const [statusCounts, revenueData] = await Promise.all([
      Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } },
      ]),
      Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'active', 'completed'] } } },
        { $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 },
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]),
    ]);

    res.json({ success: true, data: { statusCounts, revenueData } });
  } catch (err) {
    next(err);
  }
};

/* ── POST /api/bookings/:id/rate ── (Customer) */
exports.rateBooking = async (req, res, next) => {
  try {
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5 stars' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Verify ownership
    if (booking.customerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to rate this booking' });
    }

    // Verify completed status
    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only rate completed bookings' });
    }

    booking.rating = rating;
    booking.feedback = feedback || '';
    await booking.save();

    // Recalculate vehicle rating stats
    const stats = await Booking.aggregate([
      { $match: { vehicleId: booking.vehicleId, status: 'completed', rating: { $exists: true } } },
      { $group: {
        _id: '$vehicleId',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }}
    ]);

    if (stats.length > 0) {
      await Vehicle.findByIdAndUpdate(booking.vehicleId, {
        rating: stats[0].avgRating,
        reviews: stats[0].numReviews
      });
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

/* ── PATCH /api/bookings/:id/pay ── (Customer — pay booking amount) */
exports.submitPayment = async (req, res, next) => {
  try {
    const { method, details = {} } = req.body;
    if (!['upi', 'card', 'cash'].includes(method)) {
      return res.status(400).json({ success: false, message: 'Invalid payment method' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Validate customer ownership
    if (booking.customerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Must be confirmed by agency before payment
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ success: false, message: 'Booking must be approved by agency before payment' });
    }

    booking.paymentMethod = method;
    booking.paymentStatus = 'pending_approval';
    booking.paymentDetails = details;
    await booking.save();

    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

/* ── PATCH /api/bookings/:id/confirm-payment ── (Agency — approve payment) */
exports.confirmPayment = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Validate agency ownership
    if (booking.agencyId.toString() !== req.user.agencyId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to approve payment for this booking' });
    }

    if (booking.paymentStatus !== 'pending_approval') {
      return res.status(400).json({ success: false, message: 'No pending payment for this booking' });
    }

    booking.paymentStatus = 'paid';
    booking.status = 'active'; // Journey starts!
    await booking.save();

    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

