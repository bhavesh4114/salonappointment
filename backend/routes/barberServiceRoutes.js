import express from 'express';
import multer from 'multer';
import { barberAuth } from '../middleware/auth.js';
import uploadServiceImage from '../utils/uploadServiceImage.js';
import {
  createService,
  getBarberServices,
  getServicesByFilter,
  updateServiceIsActive,
} from '../controllers/barberServiceController.js';
import { getBarbersController } from '../controllers/barberController.js';

const router = express.Router();

/**
 * Handle multer errors (file type, size) without breaking barberAuth
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'Image must be 2MB or less' });
    }
    return res.status(400).json({ success: false, message: err.message || 'File upload error' });
  }
  if (err && err.message && err.message.includes('Only image files')) {
    return res.status(400).json({ success: false, message: 'Only image files are allowed' });
  }
  next(err);
};

/**
 * 🔒 BARBER DASHBOARD (PRIVATE)
 */
router.post(
  '/services',
  barberAuth,
  (req, res, next) => {
    uploadServiceImage.single('image')(req, res, (err) => {
      if (err) return handleMulterError(err, req, res, next);
      next();
    });
  },
  createService
);

router.get(
  '/services',
  barberAuth,
  getBarberServices
);

router.patch(
  '/services/:id',
  barberAuth,
  updateServiceIsActive
);

/**
 * 🌐 USER WEBSITE (PUBLIC)
 */
router.get(
  '/public/services',
  getServicesByFilter
);

router.get(
  '/barbers/filter',
  getBarbersController
);

export default router;
