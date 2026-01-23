import express from 'express';
import { barberAuth } from '../middleware/auth.js';
import uploadServiceImage from '../utils/uploadServiceImage.js';
import {
  createService,
  getBarberServices,
  getServicesByFilter
} from '../controllers/barberServiceController.js';
import { getBarbersController } from '../controllers/barberController.js';
const router = express.Router();

/**
 * BARBER DASHBOARD (PRIVATE)
 */
router.post(
  '/services',
  barberAuth,
  uploadServiceImage.single('image'),
  createService
);

router.get(
  '/services/my',
  barberAuth,
  getBarberServices
);

/**
 * USER WEBSITE (PUBLIC)
 */
router.get(
  '/services',
  getServicesByFilter
);
// 🔥 CHANGE THIS
router.get('/barbers/filter', getBarbersController);


export default router;
