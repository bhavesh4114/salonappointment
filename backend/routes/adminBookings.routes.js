import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { listBookings, getBookingStats } from '../controllers/adminBookings.controller.js';

const router = express.Router();

// Admin-only bookings routes
router.use(protect, authorize('admin'));

router.get('/', listBookings);
router.get('/stats', getBookingStats);

export default router;

