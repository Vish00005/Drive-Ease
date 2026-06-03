const express = require('express');
const {
  getVehicles, getVehicle, createVehicle,
  updateVehicle, deleteVehicle, toggleAvailability, getMyFleet, getDistinctLocations,
} = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/',    getVehicles);
router.get('/agency/fleet', protect, authorize('agency'), getMyFleet);
router.get('/locations', getDistinctLocations);
router.get('/:id', getVehicle);

router.post('/',   protect, authorize('agency'), createVehicle);
router.put('/:id', protect, authorize('agency', 'admin'), updateVehicle);
router.delete('/:id', protect, authorize('agency', 'admin'), deleteVehicle);
router.patch('/:id/availability', protect, authorize('agency'), toggleAvailability);

module.exports = router;
