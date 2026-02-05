import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { listBarbers, getBarberStats } from '../controllers/adminBarbers.controller.js';

const router = express.Router();

// All admin barber routes require authenticated admin user
router.use(protect, authorize('admin'));

// GET /api/admin/barbers - list barbers with pagination + search
router.get('/', listBarbers);

// GET /api/admin/barbers/stats - top stat cards data
router.get('/stats', getBarberStats);

export default router;

