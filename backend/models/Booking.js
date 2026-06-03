const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agency',
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    days: {
      type: Number,
      required: true,
      min: 1,
    },
    durationType: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'active', 'completed', 'rejected', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'pending_approval', 'paid'],
      default: 'unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['none', 'upi', 'card', 'cash'],
      default: 'none',
    },
    paymentDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    pickupLocation: {
      type: String,
      required: true,
    },
    vehicleName: { type: String }, // denormalized for quick display
    customerName: { type: String }, // denormalized
    notes: { type: String, default: '' },
    rejectionReason: { type: String, default: '' },
    rating: { type: Number, min: 1, max: 5 },
    feedback: { type: String, default: '' },
  },
  { timestamps: true }
);

/* ── Indexes ── */
BookingSchema.index({ customerId: 1, status: 1 });
BookingSchema.index({ agencyId: 1, status: 1 });
BookingSchema.index({ vehicleId: 1 });
BookingSchema.index({ createdAt: -1 });

/* ── Validate dates ── */
BookingSchema.pre('save', function (next) {
  if (this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  next();
});

module.exports = mongoose.model('Booking', BookingSchema);
