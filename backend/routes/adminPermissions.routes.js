import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getPermissionCounts } from '../controllers/adminPermissions.controller.js';

const router = express.Router();

// All routes require admin role
router.use(protect, authorize('admin'));

// GET /api/admin/permissions/stats
router.get('/stats', getPermissionCounts);

export default router;

