import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { listServices } from '../controllers/adminServices.controller.js';

const router = express.Router();

// All admin services routes require authenticated admin user
router.use(protect, authorize('admin'));

// GET /api/admin/services - list all services with pagination
router.get('/', listServices);

export default router;

