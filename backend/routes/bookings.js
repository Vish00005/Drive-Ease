const express = require("express");
const {
  createBooking,
  getMyBookings,
  getAgencyBookings,
  getAllBookings,
  updateBookingStatus,
  cancelBooking,
  getStats,
  rateBooking,
  submitPayment,
  confirmPayment,
} = require("../controllers/bookingController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Admin
router.get("/", protect, authorize("admin"), getAllBookings);
router.get("/stats", protect, authorize("admin"), getStats);

// Customer
router.post("/", protect, authorize("customer"), createBooking);
router.get("/my", protect, authorize("customer"), getMyBookings);
router.post("/:id/rate", protect, authorize("customer"), rateBooking);
router.patch("/:id/pay", protect, authorize("customer"), submitPayment);
router.delete("/:id", protect, authorize("customer"), cancelBooking);

// Agency
router.get("/agency", protect, authorize("agency"), getAgencyBookings);
router.patch(
  "/:id/status",
  protect,
  authorize("agency", "admin"),
  updateBookingStatus,
);
router.patch(
  "/:id/confirm-payment",
  protect,
  authorize("agency"),
  confirmPayment,
);

module.exports = router;
