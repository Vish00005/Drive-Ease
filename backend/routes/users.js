const express = require('express');
const { getUsers, getUser, updateUserStatus, getUserStats } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/',           getUsers);
router.get('/stats',      getUserStats);
router.get('/:id',        getUser);
router.patch('/:id/status', updateUserStatus);

module.exports = router;
