import express from 'express';
import { protect } from '../middleware/auth.js';
import prisma from '../prisma/client.js';

const router = express.Router();

/*
 * Example Frontend Fetch Calls (for Vite/React):
 * 
 * // Register User
 * const register = async (userData) => {
 *   const response = await fetch('http://localhost:5000/api/auth/register', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({
 *       fullName: 'John Doe',
 *       mobileNumber: '+1234567890',
 *       email: 'john@example.com',
 *       password: 'password123',
 *       role: 'user'
 *     })
 *   });
 *   return await response.json();
 * };
 * 
 * // Login
 * const login = async (credentials) => {
 *   const response = await fetch('http://localhost:5000/api/auth/login', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({
 *       mobileNumber: '+1234567890',
 *       password: 'password123'
 *     })
 *   });
 *   const data = await response.json();
 *   if (data.token) localStorage.setItem('token', data.token);
 *   return data;
 * };
 * 
 * // Get Current User
 * const getCurrentUser = async () => {
 *   const token = localStorage.getItem('token');
 *   const response = await fetch('http://localhost:5000/api/auth/me', {
 *     headers: { 'Authorization': `Bearer ${token}` }
 *   });
 *   return await response.json();
 * };
 * 
 * // Create Appointment
 * const createAppointment = async (appointmentData) => {
 *   const token = localStorage.getItem('token');
 *   const response = await fetch('http://localhost:5000/api/appointments', {
 *     method: 'POST',
 *     headers: {
 *       'Content-Type': 'application/json',
 *       'Authorization': `Bearer ${token}`
 *     },
 *     body: JSON.stringify({
 *       barberId: 1,
 *       services: [{ service: 1, quantity: 1 }],
 *       appointmentDate: '2024-12-15T10:30:00Z',
 *       appointmentTime: '10:30 AM',
 *       notes: 'Please be gentle'
 *     })
 *   });
 *   return await response.json();
 * };
 * 
 * // Get Appointments
 * const getAppointments = async (filters = {}) => {
 *   const token = localStorage.getItem('token');
 *   const queryParams = new URLSearchParams(filters);
 *   const response = await fetch(
 *     `http://localhost:5000/api/appointments?${queryParams}`,
 *     {
 *       headers: { 'Authorization': `Bearer ${token}` }
 *     }
 *   );
 *   return await response.json();
 * };
 * 
 * // Get Single Appointment
 * const getAppointment = async (id) => {
 *   const token = localStorage.getItem('token');
 *   const response = await fetch(`http://localhost:5000/api/appointments/${id}`, {
 *     headers: { 'Authorization': `Bearer ${token}` }
 *   });
 *   return await response.json();
 * };
 */

// @route   GET /api/appointments
// @desc    Get appointments (user's or barber's)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, upcoming, past } = req.query;
    
    let where = {};
    
    // If user is a barber, get their appointments
    if (req.user.role === 'barber') {
      const barber = await prisma.barber.findUnique({
        where: { userId: req.user.id }
      });
      if (barber) {
        where.barberId = barber.id;
      }
    } else {
      // If user is a regular user, get their appointments
      where.userId = req.user.id;
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by date
    if (upcoming === 'true') {
      where.appointmentDate = { gte: new Date() };
    } else if (past === 'true') {
      where.appointmentDate = { lt: new Date() };
    }

const appointments = await prisma.appointment.findMany({
  where,
  include: {
    user: {
      select: {
        id: true,
        fullName: true,
        email: true,
        mobileNumber: true
      }
    },
    barber: {
      select: {
        id: true,
        fullName: true,
        shopName: true,
        shopAddress: true
      }
    },
    services: {
      include: {
        service: true
      }
    },
    payment: true
  },
  orderBy: [
    { appointmentDate: 'asc' },
    { appointmentTime: 'asc' }
  ]
});


    res.json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get single appointment
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    if (isNaN(appointmentId)) {
      return res.status(400).json({ message: 'Invalid appointment ID' });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            mobileNumber: true
          }
        },
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
        },
        services: {
          include: {
            service: true
          }
        },
        payment: true
      }
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check authorization
    if (req.user.role === 'barber') {
      const barber = await prisma.barber.findUnique({
        where: { userId: req.user.id }
      });
      if (barber && appointment.barberId !== barber.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    } else {
      if (appointment.userId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    res.json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/appointments
// @desc    Create a new appointment
// @access  Private (User only)
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role === 'barber') {
      return res.status(403).json({ message: 'Barbers cannot create appointments' });
    }

    const { barberId, services, appointmentDate, appointmentTime, notes } = req.body;

    // Validate barber exists
    const barberIdInt = parseInt(barberId);
    if (isNaN(barberIdInt)) {
      return res.status(400).json({ message: 'Invalid barber ID' });
    }

    const barber = await prisma.barber.findUnique({
      where: { id: barberIdInt }
    });
    if (!barber) {
      return res.status(404).json({ message: 'Barber not found' });
    }

    // Validate services and calculate total
    let totalAmount = 0;
    let totalDuration = 0;
    const serviceDetails = [];

    for (const item of services) {
      const serviceIdInt = parseInt(item.service);
      if (isNaN(serviceIdInt)) {
        return res.status(400).json({ message: `Invalid service ID: ${item.service}` });
      }

      const service = await prisma.service.findUnique({
        where: { id: serviceIdInt }
      });
      if (!service || !service.isActive) {
        return res.status(404).json({ message: `Service ${item.service} not found` });
      }
      
      const quantity = item.quantity || 1;
      totalAmount += service.price * quantity;
      totalDuration += service.duration * quantity;
      
      serviceDetails.push({
        serviceId: service.id,
        quantity,
        price: service.price
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId: req.user.id,
        barberId: barber.id,
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        duration: totalDuration,
        totalAmount,
        notes: notes || '',
        services: {
          create: serviceDetails
        }
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            mobileNumber: true
          }
        },
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
        },
        services: {
          include: {
            service: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/appointments/:id/status
// @desc    Update appointment status
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    if (isNaN(appointmentId)) {
      return res.status(400).json({ message: 'Invalid appointment ID' });
    }

    const { status, cancellationReason } = req.body;

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Authorization check
    if (req.user.role === 'barber') {
      const barber = await prisma.barber.findUnique({
        where: { userId: req.user.id }
      });
      if (!barber || appointment.barberId !== barber.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    } else {
      if (appointment.userId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    const updateData = { status };
    if (status === 'cancelled') {
      updateData.cancellationReason = cancellationReason || '';
      updateData.cancelledAt = new Date();
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            mobileNumber: true
          }
        },
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
        },
        services: {
          include: {
            service: true
          }
        }
      }
    });

    res.json({
      success: true,
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
