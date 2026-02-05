import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import prisma from '../prisma/client.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT Token (include role for role-based access)
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role: role || 'user' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('mobileNumber').trim().notEmpty().withMessage('Mobile number is required'),
  body('email').optional().isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Invalid role. Barber registration must use /api/barber/register')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, mobileNumber, email, password, countryCode, role } = req.body;

    // IMPORTANT: This route is ONLY for User registration
    // Barber registration should use /api/barber/register
    if (role === 'barber') {
      return res.status(400).json({ 
        message: 'Barber registration is not allowed through this endpoint. Please use /api/barber/register' 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { mobileNumber },
          ...(email ? [{ email }] : [])
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this mobile number or email' 
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user (ONLY User table, no Barber involvement)
    const user = await prisma.user.create({
      data: {
        fullName,
        mobileNumber,
        email: email || null,
        password: hashedPassword,
        countryCode: countryCode || '+1',
        role: role || 'user' // Only 'user' or 'admin', never 'barber'
      }
    });

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('mobileNumber').optional().trim().notEmpty(),
  body('email').optional().isEmail(),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { mobileNumber, email, password } = req.body;

    if (!mobileNumber && !email) {
      return res.status(400).json({ message: 'Please provide mobile number or email' });
    }

    // Find user
    const user = await prisma.user.findFirst({
      where: mobileNumber ? { mobileNumber } : { email }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Validate password with bcrypt.compare (never compare plain text; stored password must be hashed)
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        mobileNumber: true,
        role: true,
        isVerified: true,
        avatar: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
