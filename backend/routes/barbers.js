import express from 'express';
import { barberAuth } from '../middleware/auth.js';
import prisma from '../prisma/client.js';
import { getBarbersController } from '../controllers/barberController.js';
import { getBarberByIdController } from '../controllers/barberController.js';

const router = express.Router();

/**
 * 🔥 FILTER BARBERS (PUBLIC)
 * GET /api/barbers/filter?category=FACIAL&gender=WOMEN&plan=PRIME
 */
router.get('/filter', getBarbersController);

/**
 * 🔒 GET CURRENT BARBER PROFILE
 * GET /api/barbers/profile/me
 */
router.get('/profile/me', barberAuth, async (req, res) => {
  try {
    const barberId = req.barber.id;

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
        categories: {
          include: { category: true }
        }
      }
    });

    if (!barber) {
      return res.status(404).json({ message: 'Barber profile not found' });
    }

    res.json({
      success: true,
      barber
    });
  } catch (error) {
    console.error('Get barber profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * 🔒 UPDATE BARBER PROFILE
 * PUT /api/barbers/profile/me
 */
router.put('/profile/me', barberAuth, async (req, res) => {
  try {
    const barberId = req.barber.id;
    const { fullName, email, shopName, shopAddress } = req.body;

    const updatedBarber = await prisma.barber.update({
      where: { id: barberId },
      data: {
        ...(fullName && { fullName: fullName.trim() }),
        ...(email !== undefined && { email: email ? email.trim() : null }),
        ...(shopName && { shopName: shopName.trim() }),
        ...(shopAddress && { shopAddress: shopAddress.trim() })
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        mobileNumber: true,
        shopName: true,
        shopAddress: true,
        createdAt: true,
        categories: {
          include: { category: true }
        }
      }
    });

    res.json({
      success: true,
      barber: updatedBarber
    });
  } catch (error) {
    console.error('Update barber profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * 👤 GET SINGLE BARBER (ALWAYS LAST)
 * GET /api/barbers/:id
 */
router.get('/:id', getBarberByIdController);


export default router;
