import prisma from '../prisma/client.js';
import { registerBarber, registerBarberForSubscription, getAllowedCategories, loginBarber } from '../services/barberService.js';
import { getRegistrationFeeInRupees, verifyPaymentSignature } from '../services/paymentService.js';
import {
  createRazorpayCustomer,
  createBarberSubscription,
  linkBarberSubscription,
} from '../services/razorpaySubscription.service.js';
import jwt from 'jsonwebtoken';

// Generate JWT Token for barber
// ✅ Generate JWT Token for BARBER (FINAL & SAFE)
// ✅ FINAL & SAFE

const generateBarberToken = (barberId) => {
  return jwt.sign(
    {
      barberId: Number(barberId), // 🔥 FIX
      role: "BARBER"
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};



/**
 * POST /api/barber/register (DISABLED)
 * Use POST /api/barber/register-with-payment (payment first) or register-with-subscription.
 */
export const registerBarberController = async (req, res) => {
  return res.status(410).json({
    success: false,
    message: 'Use the barber registration page: payment of ₹499 is required to complete registration.',
    useInstead: 'POST /api/barber/register-with-payment (after Razorpay payment success)',
  });
};

/**
 * Verify Razorpay payment signature and register barber. No barber data is saved before verification.
 * POST /api/barber/register-with-payment
 * Body: razorpay_order_id, razorpay_payment_id, razorpay_signature (or camelCase) + barber fields:
 *   fullName, mobileNumber, email?, password, shopName, shopAddress, categories[]
 */
export const verifyAndRegisterBarberController = async (req, res) => {
  try {
    const body = req.body || {};
    const orderId = (body.razorpay_order_id ?? body.razorpayOrderId ?? '').trim();
    const paymentId = (body.razorpay_payment_id ?? body.razorpayPaymentId ?? '').trim();
    const signature = (body.razorpay_signature ?? body.razorpaySignature ?? '').trim();

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        message: 'razorpay_order_id, razorpay_payment_id and razorpay_signature are required',
      });
    }

    const isValid = verifyPaymentSignature(orderId, paymentId, signature);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Payment could not be verified.',
      });
    }

    const {
      fullName,
      mobileNumber,
      email,
      password,
      shopName,
      shopAddress,
      categories,
    } = body;

    if (!fullName || !String(fullName).trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }
    if (!mobileNumber || !String(mobileNumber).trim()) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    if (!shopName || !String(shopName).trim()) {
      return res.status(400).json({ success: false, message: 'Shop name is required' });
    }
    if (!shopAddress || !String(shopAddress).trim()) {
      return res.status(400).json({ success: false, message: 'Shop address is required' });
    }
    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one category is required' });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const barber = await registerBarber({
      fullName: String(fullName).trim(),
      mobileNumber: String(mobileNumber).trim(),
      email: email ? String(email).trim() : null,
      password,
      shopName: String(shopName).trim(),
      shopAddress: String(shopAddress).trim(),
      categories,
      paymentId,
      orderId,
    });

    await prisma.barber.update({
      where: { id: barber.id },
      data: { subscriptionStatus: 'ACTIVE' },
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful. You can log in now.',
      barberId: barber.id,
    });
  } catch (error) {
    const msg = error?.message || '';
    console.error('Verify and register barber error:', error);
    if (msg.includes('already exists') || msg.includes('already been used')) {
      return res.status(400).json({ success: false, message: msg });
    }
    return res.status(500).json({
      success: false,
      message: msg || 'Registration failed',
    });
  }
};

/**
 * Get allowed categories
 * GET /api/barber/categories
 */
export const getCategoriesController = async (req, res) => {
  try {
    const categories = getAllowedCategories();
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

export const getRegistrationFeeController = async (req, res) => {
  try {
    const fee = getRegistrationFeeInRupees();
    res.json({
      success: true,
      amount: fee,
      currency: 'INR'
    });
  } catch (error) {
    console.error('Get registration fee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registration fee'
    });
  }
};

/**
 * Register barber with Razorpay Subscription (90-day trial, mandate via Checkout).
 * POST /api/barber/register-with-subscription
 * Body: fullName, mobileNumber, email?, password, shopName, shopAddress, categories[]
 * Returns: { barberId, subscriptionId, key_id } for frontend to open Razorpay Checkout.
 */
export const registerBarberWithSubscriptionController = async (req, res) => {
  try {
    const {
      fullName,
      mobileNumber,
      email,
      password,
      shopName,
      shopAddress,
      categories,
    } = req.body || {};

    if (!fullName || !String(fullName).trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }
    if (!mobileNumber || !String(mobileNumber).trim()) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    if (!shopName || !String(shopName).trim()) {
      return res.status(400).json({ success: false, message: 'Shop name is required' });
    }
    if (!shopAddress || !String(shopAddress).trim()) {
      return res.status(400).json({ success: false, message: 'Shop address is required' });
    }
    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one category is required' });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const barber = await registerBarberForSubscription({
      fullName: String(fullName).trim(),
      mobileNumber: String(mobileNumber).trim(),
      email: email ? String(email).trim() : null,
      password,
      shopName: String(shopName).trim(),
      shopAddress: String(shopAddress).trim(),
      categories,
    });

    const keyId = process.env.RAZORPAY_KEY_ID || '';

    // Subscription is optional: only create when plan_id is configured and Razorpay succeeds.
    const planId = (process.env.RAZORPAY_PLAN_ID || process.env.RAZORPAY_BARBER_PLAN_ID || '').trim();
    let subscriptionId = null;

    if (planId) {
      try {
        const customerId = await createRazorpayCustomer(barber);
        const result = await createBarberSubscription(customerId, barber.id);
        subscriptionId = result.subscriptionId;
        await linkBarberSubscription(barber.id, customerId, result.subscriptionId, result.trialEndsAt);
      } catch (subError) {
        console.warn('Barber registration: subscription skipped or failed (registration succeeded).', subError?.message || subError);
      }
    }

    return res.status(201).json({
      success: true,
      message: subscriptionId
        ? 'Barber created. Complete mandate in Checkout to activate 90-day trial.'
        : 'Barber created successfully.',
      barberId: barber.id,
      subscriptionId,
      key_id: keyId,
    });
  } catch (error) {
    const msg = error?.message || '';
    const statusCode = error?.statusCode;
    console.error('Register barber with subscription error:', {
      message: msg,
      statusCode,
      error: error?.error,
      stack: error?.stack,
    });
    if (msg.includes('already exists') || msg.includes('category')) {
      return res.status(400).json({ success: false, message: msg });
    }
    if (
      statusCode === 400 ||
      msg.includes('Razorpay customer') ||
      msg.includes('Subscriptions feature is not enabled') ||
      msg.includes('Razorpay subscription failed')
    ) {
      return res.status(400).json({ success: false, message: msg || 'Razorpay configuration or subscription request failed.' });
    }
    return res.status(500).json({
      success: false,
      message: msg || 'Registration failed',
    });
  }
};

/**
 * Login a barber
 * POST /api/barber/login
 */
export const loginBarberController = async (req, res) => {
  try {
    const { mobileNumber, email, password } = req.body;

    // Validate input
    if (!mobileNumber && !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide mobile number or email'
      });
    }

    if (!password || !password.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Login barber (queries Barber table, not User)
    const barber = await loginBarber({
      mobileNumber,
      email,
      password
    });

    // Access control: allow only TRIAL or ACTIVE; block PENDING_MANDATE, FAILED, CANCELLED
    const status = (barber.subscriptionStatus || '').toUpperCase();
    const allowedStatuses = ['TRIAL', 'ACTIVE'];
    if (!allowedStatuses.includes(status)) {
      return res.status(403).json({
        success: false,
        message: status === 'PENDING_MANDATE'
          ? 'Please complete the payment mandate to activate your 90-day trial.'
          : 'Subscription inactive. Please update your payment to access the platform.',
        code: 'SUBSCRIPTION_INACTIVE',
        subscriptionStatus: status,
      });
    }

    // Generate JWT token
    const token = generateBarberToken(barber.id);

    res.json({
      success: true,
      token,
      barber: {
        id: barber.id,
        fullName: barber.fullName,
        email: barber.email,
        mobileNumber: barber.mobileNumber,
        shopName: barber.shopName,
        shopAddress: barber.shopAddress,
        role: 'barber',
        categories: barber.categories?.map(bc => bc.category?.name) || [],
        subscriptionStatus: barber.subscriptionStatus || 'TRIAL',
        isAvailable: barber.isAvailable ?? true,
      }
    });

  } catch (error) {
    console.error('Barber login error:', error);
    
    // Handle authentication errors
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
};


export const getBarbersController = async (req, res) => {
  try {
    const { serviceIds } = req.query;

    if (!serviceIds) {
      return res.status(400).json({
        success: false,
        message: 'serviceIds is required'
      });
    }

    const ids = serviceIds
      .split(',')
      .map((id) => parseInt(id, 10))
      .filter(Boolean);

    if (!ids.length) {
      return res.json({ success: true, count: 0, barbers: [] });
    }

    // Resolve barberIds from Service table using existing barberId mapping
    const services = await prisma.service.findMany({
      where: {
        id: { in: ids },
        isActive: true,
      },
      select: {
        barberId: true,
      },
    });

    const barberIds = Array.from(
      new Set(services.map((s) => s.barberId).filter((id) => !!id)),
    );

    if (!barberIds.length) {
      return res.json({ success: true, count: 0, barbers: [] });
    }

    const barbers = await prisma.barber.findMany({
      where: {
        id: { in: barberIds },
        isAvailable: true,
      },
      include: {
        services: {
          where: {
            id: { in: ids },
            isActive: true,
          },
          select: {
            id: true,
            price: true,
            duration: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    res.json({
      success: true,
      count: barbers.length,
      barbers
    });

  } catch (error) {
    console.error('Get barbers filter error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch barbers'
    });
  }
};


export const getFilteredBarbersController = async (req, res) => {
  try {
    const { serviceIds } = req.query;

    if (!serviceIds) {
      return res.status(400).json({
        success: false,
        message: "serviceIds is required"
      });
    }

    const serviceIdArray = serviceIds
      .split(',')
      .map(id => parseInt(id))
      .filter(Boolean);

    const barbers = await prisma.barber.findMany({
      where: {
        isAvailable: true,
        services: {
          some: {
            id: { in: serviceIdArray },
            isActive: true
          }
        }
      },
      include: {
        services: {
          where: {
            id: { in: serviceIdArray },
            isActive: true
          },
          select: {
            id: true,
            name: true,
            price: true,
            duration: true
          }
        },
        categories: {
          include: { category: true }
        }
      }
    });

    res.json({
      success: true,
      count: barbers.length,
      barbers
    });

  } catch (error) {
    console.error("Filter barbers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to filter barbers"
    });
  }
};

export const getBarberByIdController = async (req, res) => {
  try {
    const barberId = Number(req.params.id);

    // 🔒 Safety check
    if (!barberId || isNaN(barberId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid barber id'
      });
    }

    const barber = await prisma.barber.findUnique({
      where: { id: barberId },
      select: {
        id: true,
        fullName: true,
        email: true,
        mobileNumber: true,
        shopName: true,
        shopAddress: true,
        isAvailable: true,
        createdAt: true,
        services: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            gender: true,
            plan: true,
            duration: true,
            price: true,
            image: true,
            rating: true,
            reviewCount: true
          }
        },
        categories: {
          include: { category: true }
        }
      }
    });

    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber not found'
      });
    }

    return res.status(200).json({
      success: true,
      barber
    });

  } catch (error) {
    console.error('Get barber by id error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};



