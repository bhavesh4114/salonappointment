import express from 'express';
import prisma from '../prisma/client.js';
import { barberAuth } from '../middleware/auth.js';
import { getBarberClients } from '../controllers/barberClients.controller.js';
import { getBarberEarnings } from '../controllers/barberEarnings.controller.js';

import {
  registerBarberController,
  registerBarberWithSubscriptionController,
  verifyAndRegisterBarberController,
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
 * @route   POST /api/barber/register-with-subscription
 * @desc    Register barber with Razorpay Subscription (90-day trial); returns subscriptionId for Checkout mandate
 * @access  Public
 */
router.post('/register-with-subscription', registerBarberWithSubscriptionController);

/**
 * @route   POST /api/barber/register-with-payment
 * @desc    Verify Razorpay payment signature then register barber. No data saved before verification.
 * @access  Public
 */
router.post('/register-with-payment', verifyAndRegisterBarberController);

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

/**
 * PATCH /api/barber/availability
 * Toggle or set current barber availability.
 * Body: { available: boolean }
 * Auth: JWT (barberAuth) – barber taken from token only.
 * When ON: sets isAvailable=true, dutyStartedAt=now, dutyEndedAt=null.
 * When OFF: sets isAvailable=false, dutyEndedAt=now; dutyStartedAt unchanged.
 */
router.patch('/availability', barberAuth, async (req, res) => {
  try {
    const { available } = req.body || {};

    // Strict validation: "available" must be a boolean
    if (typeof available !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload: "available" must be a boolean',
      });
    }

    const barberId = req.user?.id;
    if (!barberId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: barber id missing from token',
      });
    }

    const now = new Date();
    const data = available
      ? { isAvailable: true, dutyStartedAt: now, dutyEndedAt: null }
      : { isAvailable: false, dutyEndedAt: now };

    const updatedBarber = await prisma.barber.update({
      where: { id: barberId },
      data,
      select: {
        id: true,
        fullName: true,
        email: true,
        mobileNumber: true,
        shopName: true,
        shopAddress: true,
        isAvailable: true,
        dutyStartedAt: true,
        dutyEndedAt: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      barber: updatedBarber,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Update barber availability error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update availability',
    });
  }
});

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
        services: {
          where: { isActive: true },
        },
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
