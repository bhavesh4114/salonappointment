import express from 'express';
import { getAvailableSlotsController } from '../controllers/slotController.js';

const router = express.Router();

/**
 * 🔥 GET AVAILABLE TIME SLOTS
 * /api/availability/:barberId?date=YYYY-MM-DD&serviceIds=1,2
 */
router.get('/:barberId', getAvailableSlotsController);

export default router;
