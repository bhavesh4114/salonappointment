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
    if (barber) where.barberId = barber;
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


    const service = await prisma.service.create({
      data: {
        ...req.body,
        barberId: barberId
      },
      include: {
        barber: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      service
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/services/:id
// @desc    Update a service
// @access  Private (Barber only)
router.put('/:id', protect, authorize('barber'), async (req, res) => {
  try {
    const barber = await prisma.barber.findUnique({
      where: { userId: req.user.id }
    });
    
    if (!barber) {
      return res.status(404).json({ message: 'Barber profile not found' });
    }

    const service = await prisma.service.findUnique({
      where: { id: req.params.id }
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if service belongs to barber
    if (service.barberId !== barber.id) {
      return res.status(403).json({ message: 'Not authorized to update this service' });
    }

    const updatedService = await prisma.service.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        barber: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      service: updatedService
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/services/:id
// @desc    Delete a service
// @access  Private (Barber only)
router.delete('/:id', protect, authorize('barber'), async (req, res) => {
  try {
    const barber = await prisma.barber.findUnique({
      where: { userId: req.user.id }
    });
    
    if (!barber) {
      return res.status(404).json({ message: 'Barber profile not found' });
    }

    const service = await prisma.service.findUnique({
      where: { id: req.params.id }
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if service belongs to barber
    if (service.barberId !== barber.id) {
      return res.status(403).json({ message: 'Not authorized to delete this service' });
    }

    // Soft delete by setting isActive to false
    await prisma.service.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
