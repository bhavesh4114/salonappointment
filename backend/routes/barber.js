import express from 'express';
import prisma from '../prisma/client.js';
import { barberAuth } from '../middleware/auth.js';
import { getBarberClients } from '../controllers/barberClients.controller.js';
import { getBarberEarnings } from '../controllers/barberEarnings.controller.js';

import {
  registerBarberController,
  getCategoriesController,
  getRegistrationFeeController,
  loginBarberController,
  getBarbersController
} from '../controllers/barberController.js';

import {
  createPaymentOrderController,
  verifyPaymentController
} from '../controllers/payment.controller.js';

const router = express.Router();

/**
 * @route   POST /api/barber/create-payment
 * @desc    Create payment order for barber registration
 * @access  Public
 */
router.post('/create-payment', createPaymentOrderController);

/**
 * @route   POST /api/barber/verify-payment
 * @desc    Verify payment
 * @access  Public
 */
router.post('/verify-payment', verifyPaymentController);

/**
 * @route   GET /api/barber/registration-fee
 * @desc    Get registration fee amount
 * @access  Public
 */
router.get('/registration-fee', getRegistrationFeeController);

/**
 * @route   POST /api/barber/register
 * @desc    Register a new barber (requires successful payment)
 * @access  Public
 */
router.post('/register', registerBarberController);

/**
 * @route   GET /api/barber/categories
 * @desc    Get list of allowed categories
 * @access  Public
 */
router.get('/categories', getCategoriesController);

/**
 * @route   POST /api/barber/login
 * @desc    Login a barber
 * @access  Public
 */
router.post('/login', loginBarberController);

/**
 * ✅ IMPORTANT
 * @route   GET /api/barber/filter
 * @desc    Get barbers based on selected serviceIds
 * @access  Public
 * Example:
 * /api/barber/filter?serviceIds=1,2,3
 */
router.get('/filter', getBarbersController);

/**
 * GET /api/barber/clients – barber’s clients (must be before /:id)
 */
router.get('/clients', barberAuth, getBarberClients);

/**
 * GET /api/barber/earnings – barber’s earnings (must be before /:id)
 */
router.get('/earnings', barberAuth, getBarberEarnings);

// Only match numeric id so /appointments, /earnings, /categories, etc. are not captured
router.get('/:id(\\d+)', async (req, res) => {
  const barberId = parseInt(req.params.id, 10);

  try {
    const barber = await prisma.barber.findUnique({
      where: { id: barberId },
      select: {
        id: true,
        fullName: true,
        email: true,
        mobileNumber: true,
        shopName: true,
        shopAddress: true,
        createdAt: true,
        services: true,
        categories: {
          include: { category: true }
        }
      }
    });


    if (!barber) {
      return res.status(404).json({ message: 'Barber not found' });
    }

    res.json({
      success: true,
      barber
    });
  } catch (error) {
    console.error('Get barber error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


export default router;
