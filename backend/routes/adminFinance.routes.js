import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getFinanceSummary } from '../controllers/adminFinance.controller.js';

const router = express.Router();

// Admin-only finance routes
router.use(protect, authorize('admin'));

router.get('/summary', getFinanceSummary);

export default router;

