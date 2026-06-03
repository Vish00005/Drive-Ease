const express = require('express');
const {
  getAgencies, getAgency, updateAgencyStatus,
  updateAgencyProfile, getAgencyStats, subscribeToPlan,
} = require('../controllers/agencyController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/',    protect, authorize('admin'), getAgencies);
router.get('/dashboard/stats', protect, authorize('agency'), getAgencyStats);
router.post('/subscribe', protect, authorize('agency'), subscribeToPlan);
router.get('/:id', getAgency);  // Public — for customer view

router.patch('/:id/status', protect, authorize('admin'), updateAgencyStatus);
router.put('/profile/me',   protect, authorize('agency'), updateAgencyProfile);

module.exports = router;
