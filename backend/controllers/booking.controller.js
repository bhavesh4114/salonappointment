import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Create booking AFTER successful payment
 */
export const createBooking = async (req, res) => {
  try {
    const userId = req.user.id; // 🔒 from auth middleware

    const {
      barberId,
      services,        // [{ id, price }]
      bookingDate,
      bookingTime,
      totalAmount,

      // Razorpay
      razorpayPaymentId,
      razorpayOrderId
    } = req.body;

    // 🔴 Validation
    if (
      !barberId ||
      !Array.isArray(services) ||
      services.length === 0 ||
      !bookingDate ||
      !bookingTime ||
      !totalAmount ||
      !razorpayPaymentId ||
      !razorpayOrderId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid booking data"
      });
    }

    // 🟢 STEP 1: CREATE APPOINTMENT (BOOKING)
    const appointment = await prisma.appointment.create({
      data: {
        userId,
        barberId,
        appointmentDate: new Date(bookingDate),
        appointmentTime: bookingTime,
        totalAmount,
        status: "confirmed",
        paymentStatus: "paid",
        services: {
          create: services.map(service => ({
            serviceId: service.id,
            price: service.price
          }))
        }
      }
    });

    // 🟢 STEP 2: CREATE PAYMENT ENTRY
    await prisma.payment.create({
      data: {
        appointmentId: appointment.id,
        userId,
        amount: totalAmount,
        currency: "INR",
        paymentMethod: "razorpay",
        paymentStatus: "completed",
        transactionId: razorpayPaymentId,
        razorpayOrderId,
        razorpayPaymentId,
        paymentGateway: "razorpay"
      }
    });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      appointmentId: appointment.id
    });

  } catch (error) {
    console.error("Create booking error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create booking"
    });
  }
};
