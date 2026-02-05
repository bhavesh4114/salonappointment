import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { listUsers, getStats } from '../controllers/adminUsers.controller.js';

const router = express.Router();

// All routes require admin role; admins are never listed or counted here
router.use(protect, authorize('admin'));

// GET /api/admin/users - list users (role = "user" only), pagination + search
router.get('/', listUsers);

// GET /api/admin/users/stats - total and active counts (role = "user" only)
router.get('/stats', getStats);

export default router;
