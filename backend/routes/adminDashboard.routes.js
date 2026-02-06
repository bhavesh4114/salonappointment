import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getActiveUsersCount,
  updateBarberAvailability
} from '../controllers/adminDashboard.controller.js';

const router = express.Router();

// Admin-only dashboard routes
router.use(protect, authorize('admin'));

// GET /api/admin/dashboard/active-users
router.get('/active-users', getActiveUsersCount);

// PATCH /api/admin/dashboard/barber/availability
router.patch('/barber/availability', updateBarberAvailability);

export default router;
