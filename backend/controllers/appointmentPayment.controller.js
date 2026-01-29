import prisma from "../prisma/client.js";

export const createAppointmentAfterPayment = async (req, res) => {
  try {
    const {
      barberId,
      appointmentDate,
      appointmentTime,
      serviceIds,
      razorpayPaymentId
    } = req.body;

    const userId = req.user.id; // 🔥 JWT user

    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds }, isActive: true }
    });

    if (!services.length) {
      return res.status(400).json({ message: "Invalid services" });
    }

    const duration = services.reduce((s, x) => s + x.duration, 0);
    const amount = services.reduce((s, x) => s + x.price, 0);

    // SLOT CHECK
    const toMin = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    const toTime = (min) =>
      `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

    const start = toMin(appointmentTime);
    const end = start + duration;

    const conflict = await prisma.appointment.findFirst({
      where: {
        barberId,
        appointmentDate: new Date(appointmentDate),
        AND: [
          { appointmentTime: { lt: toTime(end) } },
          { appointmentTime: { gt: toTime(start - duration) } }
        ]
      }
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "This slot is already booked"
      });
    }

    // ✅ CREATE APPOINTMENT (CORRECT WAY)
    const appointment = await prisma.appointment.create({
      data: {
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        duration,
        totalAmount: amount,
        status: "confirmed",
        paymentStatus: "completed",

        user: {
          connect: { id: userId }
        },

        barber: {
          connect: { id: barberId }
        },

        services: {
          create: services.map(s => ({
            serviceId: s.id,
            price: s.price
          }))
        }
      }
    });

    // ✅ CREATE PAYMENT
    await prisma.payment.create({
      data: {
        appointmentId: appointment.id,
        userId,
        amount,
        currency: "INR",
        paymentMethod: "ONLINE",
        paymentStatus: "completed",
        transactionId: razorpayPaymentId,
        paymentGateway: "RAZORPAY"
      }
    });

    res.json({ success: true, appointmentId: appointment.id });

  } catch (error) {
    console.error("Payment appointment error:", error);
    res.status(500).json({ success: false });
  }
};
