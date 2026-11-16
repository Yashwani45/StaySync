const express = require('express');
const router = express.Router();
const {
  getAvailableBeds,
  holdBed,
  releaseBed,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  getOwnerOccupancyCalendar
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

// Public or Protected: Check room & bed live availability
router.get('/available-beds/:propertyId', getAvailableBeds);

// Protected: Bed locking & booking workflows
router.post('/hold-bed', protect, holdBed);
router.post('/release-bed', protect, releaseBed);
router.post('/create', protect, createBooking);
router.put('/:id/status', protect, updateBookingStatus);
router.post('/:id/cancel', protect, cancelBooking);

// Protected: Owner occupancy calendar
router.get(
  '/owner-calendar/:propertyId',
  protect,
  authorize('PROPERTY_OWNER', 'HOSTEL_OWNER', 'PG_OWNER', 'ROOM_OWNER', 'ADMIN', 'SUPER_ADMIN'),
  getOwnerOccupancyCalendar
);

module.exports = router;
