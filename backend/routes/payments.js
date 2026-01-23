import express from 'express';
import { protect } from '../middleware/auth.js';
import prisma from '../prisma/client.js';

const router = express.Router();

// @route   POST /api/payments
// @desc    Create a payment
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { appointmentId, paymentMethod, transactionId, paymentDetails } = req.body;

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check authorization
    if (appointment.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if payment already exists
    if (appointment.paymentId) {
      return res.status(400).json({ message: 'Payment already exists for this appointment' });
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        appointmentId: appointment.id,
        userId: req.user.id,
        amount: appointment.totalAmount,
        paymentMethod,
        transactionId: transactionId || '',
        paymentStatus: 'completed', // In production, this would be set based on payment gateway response
        paymentDetails: paymentDetails || {},
        paymentGateway: 'manual' // Update based on actual payment gateway
      }
    });

    // Update appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        paymentId: payment.id,
        paymentStatus: 'paid',
        status: 'confirmed'
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    const populatedPayment = await prisma.payment.findUnique({
      where: { id: payment.id },
      include: {
        appointment: {
          include: {
            barber: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true
                  }
                }
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      payment: populatedPayment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/payments
// @desc    Get user payments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user.id },
      include: {
        appointment: {
          include: {
            barber: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/payments/:id
// @desc    Get single payment
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
      include: {
        appointment: {
          include: {
            barber: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true
                  }
                }
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check authorization
    if (payment.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
