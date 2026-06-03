const mongoose = require('mongoose');

const AgencySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Agency name is required'],
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    location: {
      type: String,
      default: 'Mumbai',
    },
    logo: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'suspended'],
      default: 'pending',
    },
    subscriptionPlan: {
      type: String,
      enum: ['none', 'starter', 'growth', 'enterprise'],
      default: 'none',
    },
    subscriptionStatus: {
      type: String,
      enum: ['none', 'active', 'inactive'],
      default: 'none',
    },
    subscriptionExpiresAt: {
      type: Date,
      default: null,
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    activeBookings: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

/* ── Virtual: fleet count ── */
AgencySchema.virtual('fleetCount', {
  ref: 'Vehicle',
  localField: '_id',
  foreignField: 'agencyId',
  count: true,
});

module.exports = mongoose.model('Agency', AgencySchema);
