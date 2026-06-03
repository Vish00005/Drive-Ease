const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Agency = require('../models/Agency');
const cloudinary = require('../config/cloud');

/* ── GET /api/vehicles ── (Public, with filters) */
exports.getVehicles = async (req, res, next) => {
  try {
    const {
      type, fuelType, transmission, location,
      available, minPrice, maxPrice,
      sortBy = 'createdAt', order = 'desc',
      page = 1, limit = 12, search,
      startDate, endDate,
    } = req.query;

    const query = {};

    if (type)         query.type = type;
    if (fuelType)     query.fuelType = fuelType;
    if (transmission) query.transmission = transmission;
    if (location)     query.location = location;
    if (available !== undefined) query.available = available === 'true';

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start < end) {
        const overlappingBookings = await Booking.find({
          status: { $in: ['pending', 'confirmed', 'active'] },
          startDate: { $lt: end },
          endDate: { $gt: start }
        }).select('vehicleId');
        const bookedVehicleIds = overlappingBookings.map(b => b.vehicleId.toString());
        query._id = { $nin: bookedVehicleIds };
      }
    }

    if (minPrice || maxPrice) {
      query['price.daily'] = {};
      if (minPrice) query['price.daily'].$gte = Number(minPrice);
      if (maxPrice) query['price.daily'].$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortMap = {
      price_asc:  { 'price.daily': 1 },
      price_desc: { 'price.daily': -1 },
      rating:     { rating: -1 },
      newest:     { createdAt: -1 },
      default:    { createdAt: -1 },
    };
    const sort = sortMap[sortBy] || sortMap.default;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Vehicle.countDocuments(query);
    const vehicles = await Vehicle.find(query)
      .populate('agencyId', 'name location logo status')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Check which vehicles are booked today
    const Booking = require('../models/Booking');
    const todayDate = new Date();
    const activeBookings = await Booking.find({
      status: { $in: ['confirmed', 'active'] },
      startDate: { $lte: todayDate },
      endDate: { $gte: todayDate }
    }).select('vehicleId');

    const bookedVehicleIds = new Set(activeBookings.map(b => b.vehicleId.toString()));

    const formattedVehicles = vehicles.map(v => {
      const obj = v.toObject();
      obj.isBookedToday = bookedVehicleIds.has(v._id.toString());
      return obj;
    });

    res.json({
      success: true,
      count: vehicles.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: formattedVehicles,
    });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/vehicles/:id ── (Public) */
exports.getVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('agencyId', 'name location logo phone email status rating');

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // Fetch confirmed/active bookings for this vehicle to show booked date ranges
    const Booking = require('../models/Booking');
    const bookings = await Booking.find({
      vehicleId: req.params.id,
      status: { $in: ['confirmed', 'active'] }
    }).select('startDate endDate');

    const todayDate = new Date();
    const isBookedToday = bookings.some(b => 
      new Date(b.startDate) <= todayDate && new Date(b.endDate) >= todayDate
    );

    res.json({
      success: true,
      data: {
        ...vehicle.toObject(),
        bookings: bookings.map(b => ({ startDate: b.startDate, endDate: b.endDate })),
        isBookedToday
      }
    });
  } catch (err) {
    next(err);
  }
};

/* ── POST /api/vehicles ── (Agency) */
exports.createVehicle = async (req, res, next) => {
  try {
    const agency = await Agency.findById(req.user.agencyId);
    if (!agency || agency.subscriptionStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'An active subscription is required to add vehicles to your fleet. Please subscribe to a plan first.'
      });
    }

    // Check plan limits
    const currentCount = await Vehicle.countDocuments({ agencyId: agency._id });
    if (agency.subscriptionPlan === 'starter' && currentCount >= 5) {
      return res.status(403).json({
        success: false,
        message: 'Limit reached! Your Starter plan only allows up to 5 vehicles. Please upgrade your plan to add more.'
      });
    }
    if (agency.subscriptionPlan === 'growth' && currentCount >= 15) {
      return res.status(403).json({
        success: false,
        message: 'Limit reached! Your Growth plan only allows up to 15 vehicles. Please upgrade your plan to add more.'
      });
    }

    const { image, ...rest } = req.body;
    let images = [];
    if (image && image.startsWith('data:')) {
      const uploadRes = await cloudinary.uploader.upload(image, {
        folder: 'driveease_vehicles',
      });
      images.push(uploadRes.secure_url);
    }

    const vehicle = await Vehicle.create({
      ...rest,
      images,
      agencyId: req.user.agencyId,
    });
    res.status(201).json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
};

/* ── PUT /api/vehicles/:id ── (Agency — own vehicles only) */
exports.updateVehicle = async (req, res, next) => {
  try {
    let vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

    // Agency can only edit their own vehicles
    if (req.user.role === 'agency' && vehicle.agencyId.toString() !== req.user.agencyId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this vehicle' });
    }

    const { image, ...rest } = req.body;
    let images = vehicle.images;
    if (image === '') {
      images = [];
    } else if (image && image.startsWith('data:')) {
      const uploadRes = await cloudinary.uploader.upload(image, {
        folder: 'driveease_vehicles',
      });
      images = [uploadRes.secure_url];
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(req.params.id, {
      ...rest,
      images,
    }, {
      new: true, runValidators: true,
    });

    res.json({ success: true, data: updatedVehicle });
  } catch (err) {
    next(err);
  }
};

/* ── DELETE /api/vehicles/:id ── (Agency / Admin) */
exports.deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

    if (req.user.role === 'agency' && vehicle.agencyId.toString() !== req.user.agencyId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await vehicle.deleteOne();
    res.json({ success: true, message: 'Vehicle removed' });
  } catch (err) {
    next(err);
  }
};

/* ── PATCH /api/vehicles/:id/availability ── (Agency) */
exports.toggleAvailability = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

    if (vehicle.agencyId.toString() !== req.user.agencyId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    vehicle.available = !vehicle.available;
    await vehicle.save();

    res.json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/vehicles/agency/fleet ── (Agency — own fleet) */
exports.getMyFleet = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ agencyId: req.user.agencyId }).sort({ createdAt: -1 });
    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/vehicles/locations ── (Public — distinct locations) */
exports.getDistinctLocations = async (req, res, next) => {
  try {
    const locations = await Vehicle.distinct('location');
    // Filter out empty locations and sort alphabetically
    const filtered = locations.filter(l => !!l).sort();
    res.json({ success: true, data: filtered });
  } catch (err) {
    next(err);
  }
};

