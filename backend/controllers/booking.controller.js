import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Get booked slots for a barber + date
 */
export const getBookedSlots = async (req, res) => {
  try {
    const barberId = Number(req.query.barberId);
    const date = req.query.date;

    if (!barberId || !date) {
      return res.status(400).json({
        success: false,
        message: "barberId and date are required"
      });
    }

    // Same calendar day: use UTC midnight so it matches how we store appointmentDate (YYYY-MM-DD)
    const startOfDay = new Date(date + "T00:00:00.000Z");
    const endOfDay = new Date(date + "T23:59:59.999Z");

    const appointments = await prisma.appointment.findMany({
      where: {
        barberId,
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: { notIn: ["cancelled", "CANCELLED", "declined", "DECLINED", "rejected", "REJECTED"] }
      },
      select: { appointmentTime: true }
    });

    const bookedTimes = appointments.map((a) => a.appointmentTime);
    return res.status(200).json({ success: true, bookedTimes });
  } catch (error) {
    console.error("Get booked slots error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch booked slots"
    });
  }
};

/**
 * Create booking REQUEST (no payment). Status PENDING, paymentStatus pending.
 * User must wait for barber confirmation; payment is only allowed after CONFIRMED.
 */
export const createBookingRequest = async (req, res) => {
  try {
    const userId = req.user.id;

    const { barberId, bookingDate, bookingTime, services } = req.body;

    if (!barberId || !bookingDate || !bookingTime || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing barberId, bookingDate, bookingTime, or services",
      });
    }

    const barberIdNum = Number(barberId);
    const appointmentDate = new Date(bookingDate);

    const serviceIds = services.map((s) => (typeof s === "object" && s != null ? s.id ?? s.serviceId : s)).filter(Boolean);
    if (serviceIds.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid services" });
    }

    const serviceRows = await prisma.service.findMany({
      where: { id: { in: serviceIds }, isActive: true },
    });
    if (serviceRows.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid services" });
    }

    const duration = serviceRows.reduce((s, x) => s + (x.duration || 0), 0);
    const totalAmount = serviceRows.reduce((s, x) => s + Number(x.price || 0), 0);

    const existing = await prisma.appointment.findFirst({
      where: {
        barberId: barberIdNum,
        appointmentDate,
        appointmentTime: String(bookingTime).trim(),
        status: { notIn: ["cancelled", "CANCELLED", "declined", "DECLINED", "rejected", "REJECTED"] },
      },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This slot is already booked. Please choose another time.",
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId,
        barberId: barberIdNum,
        appointmentDate,
        appointmentTime: String(bookingTime).trim(),
        duration,
        totalAmount,
        status: "pending",
        paymentStatus: "pending",
        services: {
          create: serviceRows.map((s) => ({
            serviceId: s.id,
            price: s.price,
            quantity: 1,
          })),
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Booking request submitted. Waiting for barber confirmation.",
      appointmentId: appointment.id,
    });
  } catch (error) {
    if (error?.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "This slot is already booked. Please choose another time.",
      });
    }
    console.error("Create booking request error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create booking request",
    });
  }
};

/**
 * Create booking AFTER successful payment (legacy / pay-on-shop may still create; primary flow is pay for CONFIRMED only)
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

    const appointmentDate = new Date(bookingDate);

    const appointment = await prisma.$transaction(async (tx) => {
      const createdAppointment = await tx.appointment.create({
        data: {
          userId,
          barberId,
          appointmentDate,
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

      await tx.payment.create({
        data: {
          appointmentId: createdAppointment.id,
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

      return createdAppointment;
    });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      appointmentId: appointment.id
    });

  } catch (error) {
    if (error?.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "This slot is already booked. Please choose another time."
      });
    }

    console.error("Create booking error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create booking"
    });
  }
};
