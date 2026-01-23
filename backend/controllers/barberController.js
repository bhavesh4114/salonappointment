import prisma from '../prisma/client.js';
import { registerBarber, getAllowedCategories, loginBarber } from '../services/barberService.js';
import { getRegistrationFeeInRupees } from '../services/paymentService.js';
import jwt from 'jsonwebtoken';

// Generate JWT Token for barber
const generateBarberToken = (id) => {
  return jwt.sign({ id, type: 'barber' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

/**
 * Register a new barber
 * POST /api/barber/register
 */
export const registerBarberController = async (req, res) => {
  try {
    const {
      fullName,
      mobileNumber,
      email,
      password,
      shopName,
      shopAddress,
      categories,
      paymentId,
      orderId
    } = req.body;

    // Validate required fields
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required'
      });
    }

    if (!mobileNumber || !mobileNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is required'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    if (!shopName || !shopName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Shop name is required'
      });
    }

    if (!shopAddress || !shopAddress.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Shop address is required'
      });
    }

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one category is required'
      });
    }

    // Validate payment ID (ONLY paymentId required)
    if (!paymentId || !paymentId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    // Validate email format if provided
   // ✅ Email OPTIONAL: validate only if present
if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  return res.status(400).json({
    success: false,
    message: 'Invalid email format'
  });
}


    // Register barber (payment verification happens inside)
    const barber = await registerBarber({
      fullName,
      mobileNumber,
      email: email || null, 
      password,
      shopName,
      shopAddress,
      categories,
      paymentId,
      orderId // Optional
    });

    // Format response (exclude password)
    const response = {
      success: true,
      message: 'Barber registered successfully',
      data: {
        id: barber.id,
        fullName: barber.fullName,
        email: barber.email,
        mobileNumber: barber.mobileNumber,
        shopName: barber.shopName,
        shopAddress: barber.shopAddress,
        categories: barber.categories.map(bc => ({
          id: bc.category.id,
          name: bc.category.name
        })),
        createdAt: barber.createdAt
      }
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Barber registration error:', error);

    // Handle known errors
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('Invalid categories')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('Payment') || error.message.includes('payment')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      return res.status(409).json({
        success: false,
        message: `A barber with this ${field} already exists`
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      message: 'Failed to register barber',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

    // Generate JWT token
    const token = generateBarberToken(barber.id);

    res.json({
      success: true,
      token,
      user: {
        id: barber.id,
        fullName: barber.fullName,
        email: barber.email,
        mobileNumber: barber.mobileNumber,
        shopName: barber.shopName,
        shopAddress: barber.shopAddress,
        role: 'barber',
        categories: barber.categories?.map(bc => bc.category?.name) || []
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
      .map(id => parseInt(id))
      .filter(Boolean);

    const barbers = await prisma.barber.findMany({
      where: {
        services: {
          some: {
            id: { in: ids },          // ✅ FIX HERE
            isActive: true
          }
        }
      },
      include: {
        services: {
          where: {
            id: { in: ids },          // ✅ FIX HERE
            isActive: true
          },
          select: {
            id: true,                // ✅ FIX HERE
            price: true,
            duration: true
          }
        },
        categories: {
          include: {
            category: true
          }
        }
      }
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
    const barberId = Number(req.params.id)

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
    })

    if (!barber) {
      return res.status(404).json({ message: 'Barber not found' })
    }

    res.json({ success: true, barber })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}


