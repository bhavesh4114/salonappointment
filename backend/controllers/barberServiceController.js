import prisma from '../prisma/client.js';

/**
 * Create a new service for the authenticated barber
 * POST /api/barber/services
 * Expects multipart/form-data (multer parses body; barberAuth runs first and sets req.barber)
 */
export const createService = async (req, res) => {
  try {
    // Barber is set by barberAuth middleware (NOT req.user)
    const barberId = req.barber?.id;

    if (!barberId) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized as barber'
      });
    }

    // Multer puts multipart text fields in req.body as strings
    const {
      name,
      description,
      category,
      gender,
      plan,
      duration,
      price,
      isActive: isActiveRaw
    } = req.body || {};

    // Basic validation for required fields
    if (!name || (typeof name === 'string' && !name.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Service name is required'
      });
    }

    if (!category || (typeof category === 'string' && !category.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }
    if (!plan || (typeof plan === 'string' && !plan.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Plan is required'
      });
    }
    if (!gender || (typeof gender === 'string' && !gender.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Gender is required'
      });
    }

    const normalizedCategory = String(category).trim().toUpperCase();
    const normalizedGender = String(gender).trim().toUpperCase();
    const normalizedPlan = String(plan).trim().toUpperCase();

    if (normalizedCategory === 'BEARD' && normalizedGender === 'WOMEN') {
      return res.status(400).json({
        success: false,
        message: 'Beard service cannot be for women'
      });
    }

    const durationNum = duration != null ? Number(duration) : NaN;
    const priceNum = price != null ? Number(price) : NaN;

    if (Number.isNaN(durationNum)) {
      return res.status(400).json({
        success: false,
        message: 'Duration is required and must be a valid number (minutes)'
      });
    }
    if (Number.isNaN(priceNum)) {
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

    // Optional image: multer sets req.file only when a file was uploaded
    let imagePath = '';
    if (req.file && typeof req.file.filename === 'string') {
      imagePath = `/uploads/services/${req.file.filename}`;
    }

    // isActive from form (string "true"/"false" or omit → default true)
    const isActive = isActiveRaw === 'false' || isActiveRaw === false ? false : true;

    // Treat incoming price as base price; store it directly in DB
    const basePrice = priceValue;
    const serviceData = {
      name: String(name).trim(),
      description: description != null ? String(description).trim() : '',
      category: normalizedCategory,
      gender: normalizedGender,
      plan: normalizedPlan,
      duration: durationMinutes,
      price: basePrice,
      image: imagePath || '',
      isActive,
      barberId
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

    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A service with these details already exists'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to add service',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

/**
 * Get all services for the authenticated barber
 * GET /api/barber/services
 */
/**
 * Get all services for the logged-in barber
 * GET /api/barber/services
 */
export const getBarberServices = async (req, res) => {
  try {
    const barberId = req.barber?.id ?? req.user?.barberId ?? req.user?.id;
    const numBarberId = barberId != null ? Number(barberId) : NaN;

    if (!numBarberId || Number.isNaN(numBarberId)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[getBarberServices] barberId missing. req.barber?.id:", req.barber?.id, "req.user?.barberId:", req.user?.barberId);
      }
      return res.status(401).json({
        success: false,
        message: "Barber not authenticated. Please log in again.",
      });
    }

    const services = await prisma.service.findMany({
      where: {
        barberId: numBarberId,
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
    console.error('Get barber services error:', error);
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

/**
 * Toggle service enabled/disabled for the authenticated barber.
 * PATCH /api/barber/services/:id
 * Body: { isActive: boolean }
 * Only the barber who owns the service can update it. Used by Barber Settings → Services toggle.
 */
export const updateServiceIsActive = async (req, res) => {
  try {
    const barberId = req.barber?.id;
    if (!barberId) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized as barber',
      });
    }

    const serviceId = Number(req.params.id);
    if (!Number.isInteger(serviceId) || serviceId < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID',
      });
    }

    const isActive = req.body?.isActive;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Body must include isActive (boolean)',
      });
    }

    const service = await prisma.service.findFirst({
      where: { id: serviceId, barberId },
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found or you do not own this service',
      });
    }

    const updated = await prisma.service.update({
      where: { id: serviceId },
      data: { isActive },
    });

    return res.status(200).json({
      success: true,
      message: isActive ? 'Service enabled' : 'Service disabled',
      data: updated,
    });
  } catch (error) {
    console.error('Update service isActive error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update service',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
};


