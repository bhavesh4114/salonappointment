import express from 'express';
import { barberAuth } from '../middleware/auth.js';
import prisma from '../prisma/client.js';

const router = express.Router();





// @route   GET /api/services
// @desc    Get all services (with filters)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, gender, barber, minPrice, maxPrice } = req.query;
    
    const where = { isActive: true };
    
    if (category) where.category = category;
    if (gender) where.gender = gender;
//     if (barber) {
//   const barberId = Number(barber);

//   if (isNaN(barberId)) {
//     return res.status(400).json({
//       success: false,
//       message: 'Invalid barber id'
//     });
//   }

//   where.barberId = barberId;
// }



    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

   const services = await prisma.service.findMany({
  where,
  include: {
    barber: true
  },
  orderBy: { createdAt: 'desc' }
});

    res.json({
      success: true,
      count: services.length,
      services
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});








// @route   GET /api/services/:id
// @desc    Get single service
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    // STEP 1: id ને string થી number માં convert કરો
    const serviceId = Number(req.params.id);

    // STEP 2: id valid છે કે નહિ check કરો
    if (isNaN(serviceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID'
      });
    }

    // STEP 3: Prisma query (id must be Int)
 const service = await prisma.service.findUnique({
  where: { id: serviceId },
  include: {
    barber: true
  }
});


    // STEP 4: Service not found
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // STEP 5: Success response
    res.status(200).json({
      success: true,
      service
    });

  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});





// @route   POST /api/services
// @desc    Create a new service
// @access  Private (Barber only)

router.post('/', barberAuth, async (req, res) => {
  try {
    const barberId = req.barber.id;

    const {
      name,
      description,
      category,
      gender,
      plan,
      price,
      duration,
      isActive,
      image
    } = req.body;

    const basePrice = Number(price) || 0;

    const service = await prisma.service.create({
      data: {
        name,
        description,
        category,
        gender,
        plan,
        price: basePrice,
        duration: Number(duration),
        isActive: isActive ?? true,
        image: image || null,
        barberId
      }
    });

    res.status(201).json({
      success: true,
      service
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// @route   PUT /api/services/:id
// @desc    Update a service
// @access  Private (Barber only)

// @route   DELETE /api/services/:id
// @desc    Delete a service
// @access  Private (Barber only)
// @route   DELETE /api/services/:id
// @desc    Delete a service
// @access  Private (Barber only)
router.delete('/:id', barberAuth, async (req, res) => {
  try {
    const serviceId = Number(req.params.id);
    if (isNaN(serviceId)) {
      return res.status(400).json({ message: 'Invalid service ID' });
    }

    const barberId = req.barber.id;

    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.barberId !== barberId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await prisma.service.update({
      where: { id: serviceId },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
