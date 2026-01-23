import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createBooking = async (req, res) => {
  try {
    const {
      userId,
      barberId,
      services,
      bookingDate,
      bookingTime,
      totalAmount,
      paymentMethod,
      paymentStatus,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature
    } = req.body;

    // Basic validation
    if (!barberId || !services || !bookingDate || !bookingTime || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        barberId,
        services,
        bookingDate,
        bookingTime,
        totalAmount,
        paymentMethod,
        paymentStatus,
        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature
      }
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking
    });

  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create booking"
    });
  }
};
