import express from 'express';
import { protect } from '../middleware/auth.js';
import prisma from '../prisma/client.js';

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        mobileNumber: true,
        countryCode: true,
        role: true,
        isVerified: true,
        avatar: true,
        createdAt: true,
        updatedAt: true
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
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { fullName, email, mobileNumber, avatar } = req.body || {};

    const updateData = {};

    if (typeof fullName === 'string' && fullName.trim()) {
      updateData.fullName = fullName.trim();
    }

    if (typeof email === 'string' && email.trim()) {
      const trimmedEmail = email.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }
      updateData.email = trimmedEmail;
    } else if (email === '') {
      // Allow clearing optional email
      updateData.email = null;
    }

    if (typeof mobileNumber === 'string' && mobileNumber.trim()) {
      updateData.mobileNumber = mobileNumber.trim();
    }

    if (avatar !== undefined) {
      // avatar is a string URL / data URL; validation (size/type) is handled on client
      updateData.avatar = avatar;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        mobileNumber: true,
        countryCode: true,
        role: true,
        isVerified: true,
        avatar: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
