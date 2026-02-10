import express from 'express';
import { protect } from '../middleware/auth.js';
import { getPermissionCounts } from '../controllers/adminPermissions.controller.js';

const router = express.Router();

// All routes require admin role (case-insensitive: admin, Admin, ADMIN)
const requireAdmin = (req, res, next) => {
  const role = (req.user && req.user.role) ? String(req.user.role).toLowerCase() : ''
  if (role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: `User role is not authorized to access this route`,
    })
  }
  next()
}

router.use(protect, requireAdmin);

// GET /api/admin/permissions/stats
router.get('/stats', getPermissionCounts);

export default router;

