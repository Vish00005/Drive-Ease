const mongoose = require("mongoose");

const PriceSchema = new mongoose.Schema(
  {
    daily: { type: Number, required: true, min: 0 },
    weekly: { type: Number, required: true, min: 0 },
    monthly: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const VehicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vehicle name is required"],
      trim: true,
    },
    brand: { type: String, required: [true, "Brand is required"], trim: true },
    model: { type: String, required: [true, "Model is required"], trim: true },
    year: {
      type: Number,
      required: true,
      min: 1990,
      max: new Date().getFullYear() + 1,
    },
    type: { type: String, enum: ["2W", "4W"], required: true },
    fuelType: {
      type: String,
      enum: ["Petrol", "Diesel", "Electric", "Hybrid"],
      required: true,
    },
    transmission: {
      type: String,
      enum: ["Manual", "Automatic"],
      required: true,
    },
    seats: { type: Number, required: true, min: 1, max: 14 },
    engine: { type: String, default: "" },
    mileage: { type: String, default: "" },
    color: { type: String, default: "" },
    location: {
      type: String,
      required: true,
    },
    price: { type: PriceSchema, required: true },
    images: [{ type: String }],
    features: [{ type: String }],
    description: { type: String, default: "" },
    available: { type: Boolean, default: true },
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agency",
      required: true,
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: Number, default: 0 },
  },
  { timestamps: true },
);

/* ── Indexes for fast filtering ── */
VehicleSchema.index({ location: 1, available: 1 });
VehicleSchema.index({ type: 1 });
VehicleSchema.index({ agencyId: 1 });
VehicleSchema.index({ "price.daily": 1 });

module.exports = mongoose.model("Vehicle", VehicleSchema);
