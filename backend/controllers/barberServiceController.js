import prisma from '../prisma/client.js';

/**
 * Create a new service for the authenticated barber
 * POST /api/barber/services
 */
export const createService = async (req, res) => {
  try {
    // Barber is attached by barberAuth middleware
    const barberId = req.barber?.id;

    if (!barberId) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized as barber'
      });
    }

    const {
  name,
  description,
  category,
  gender,
  plan,        // ✅ ADD
  duration,
  price
} = req.body;


    // Basic validation for required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Service name is required'
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }
if (!plan || !plan.trim()) {
  return res.status(400).json({
    success: false,
    message: 'Plan is required'
  });
}
if (!gender || !gender.trim()) {
  return res.status(400).json({
    success: false,
    message: 'Gender is required'
  });
}
// 🔥 NORMALIZE INPUT (IMPORTANT)
const normalizedCategory = category.trim().toUpperCase();
const normalizedGender = gender.trim().toUpperCase();
const normalizedPlan = plan.trim().toUpperCase();

// ❌ Business rule
if (normalizedCategory === 'BEARD' && normalizedGender === 'WOMEN') {
  return res.status(400).json({
    success: false,
    message: 'Beard service cannot be for women'
  });
}




    if (duration === undefined || duration === null || Number.isNaN(Number(duration))) {
      return res.status(400).json({
        success: false,
        message: 'Duration is required and must be a valid number (minutes)'
      });
    }

    if (price === undefined || price === null || Number.isNaN(Number(price))) {
      return res.status(400).json({
        success: false,
        message: 'Price is required and must be a valid number'
      });
    }

    const durationMinutes = parseInt(duration, 10);
    const priceValue = parseFloat(price);

    if (durationMinutes <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Duration must be greater than 0'
      });
    }

    if (priceValue < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative'
      });
    }

    // Handle image path (if uploaded)
    let imagePath = '';
    if (req.file && req.file.filename) {
      imagePath = `/uploads/services/${req.file.filename}`;
    }
// 🔥 NORMALIZE INPUT (IMPORTANT)


    // Prepare data with defaults
   const serviceData = {
  name: name.trim(),
  description: description ? description.trim() : '',
  category: normalizedCategory, // ✅ FIX
  gender: normalizedGender,     // ✅ FIX
  plan: normalizedPlan,         // ✅ FIX
  duration: durationMinutes,
  price: priceValue,
  image: imagePath || '',
  barberId,
};



    const service = await prisma.service.create({
      data: serviceData
    });

    return res.status(201).json({
      success: true,
      message: 'Service added successfully',
      data: service
    });
  } catch (error) {
    console.error('Create barber service error:', error);

    // Handle Prisma known errors gracefully
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A service with these details already exists'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to add service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all services for the authenticated barber
 * GET /api/barber/services
 */
export const getBarberServices = async (req, res) => {
  try {
    // ✅ STEP 1: query params define kar
    const { category, gender, plan } = req.query;

    // safety check (optional but good)
    if (!category || !gender || !plan) {
      return res.status(400).json({
        success: false,
        message: "Missing filters"
      });
    }

    // ✅ STEP 2: normalize values
    const normalizedCategory = category.trim().toUpperCase();
    const normalizedGender = gender.trim().toUpperCase();
    const normalizedPlan = plan.trim().toUpperCase();

    // ✅ STEP 3: fetch services (NO barber auth here)
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
        category: normalizedCategory,
        gender: normalizedGender,
        plan: normalizedPlan
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.json({
      success: true,
      data: services
    });

  } catch (error) {
    console.error('Get services error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch services'
    });
  }
};

/**
 * PUBLIC: Get services by category + gender (User side)
 * GET /api/barber/services?category=...&gender=...
 */
// ✅ PUBLIC SERVICE FILTER (USER SIDE)
export const getServicesByFilter = async (req, res) => {
  try {
    const { category, gender, plan } = req.query;

    if (!category || !gender || !plan) {
      return res.status(400).json({
        success: false,
        message: "Missing filters"
      });
    }

    const normalizedCategory = category.trim().toUpperCase();
    const normalizedGender = gender.trim().toUpperCase();
    const normalizedPlan = plan.trim().toUpperCase();

    const services = await prisma.service.findMany({
      where: {
        isActive: true,
        category: normalizedCategory,
        gender: normalizedGender,
        plan: normalizedPlan
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.json({
      success: true,
      data: services
    });

  } catch (error) {
    console.error('Get services by filter error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch services'
    });
  }
};


