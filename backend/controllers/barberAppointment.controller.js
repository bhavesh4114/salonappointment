import prisma from "../prisma/client.js";

/**
 * Normalize status for comparison (DB may store lowercase or uppercase)
 */
const isPending = (s) => String(s || "").toUpperCase() === "PENDING";
const isConfirmed = (s) => String(s || "").toUpperCase() === "CONFIRMED";
const isPaid = (s) => String(s || "").toUpperCase() === "PAID";

/**
 * Get date range for filter. Returns null for "All" (no date filter).
 * Today | Tomorrow | This Week | All
 */
function getDateRange(filter) {
  const f = String(filter || "All").toLowerCase();
  if (f === "all") return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  switch (f) {
    case "tomorrow":
      return { gte: tomorrow, lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000) };
    case "this week":
      return { gte: today, lt: new Date(weekEnd.getTime() + 24 * 60 * 60 * 1000) };
    case "today":
    default:
      return { gte: today, lt: tomorrow };
  }
}

/**
 * GET /api/barber/appointments
 * Secured by barberAuth: only appointments for logged-in barber (req.barber.id).
 * Returns: pendingAppointments, upcomingAppointments, summary (totalAppointments, estimatedRevenue).
 * Optional query: dateFilter = Today | Tomorrow | This Week (default Today).
 */
export const getBarberAppointments = async (req, res) => {
  try {
    if (!req.barber?.id) {
      return res.status(401).json({ success: false, message: "Barber not authenticated" });
    }

    const barberId = Number(req.barber.id);
    const dateFilter = req.query.dateFilter || "All";
    const range = getDateRange(dateFilter);

    const where = {
      barberId,
      status: { notIn: ["cancelled", "CANCELLED", "declined", "DECLINED"] },
    };
    if (range) where.appointmentDate = range;

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        user: {
          select: { id: true, fullName: true, mobileNumber: true, avatar: true },
        },
        services: {
          include: {
            service: {
              select: { id: true, name: true, duration: true },
            },
          },
        },
      },
      orderBy: [{ appointmentDate: "asc" }, { appointmentTime: "asc" }],
    });

    const pendingAppointments = appointments.filter((a) => isPending(a.status));
    const upcomingAppointments = appointments.filter((a) => isPaid(a.status));
    const isPayAtShop = (a) => String(a?.paymentMethod || "").toUpperCase() === "PAY_ON_SHOP";
    const awaitingPaymentAtShop = appointments.filter(
      (a) => isConfirmed(a.status) && isPayAtShop(a)
    );

    const totalAppointments = appointments.length;
    const estimatedRevenue = appointments.reduce((sum, a) => sum + Number(a.totalAmount || 0), 0);

    if (totalAppointments === 0) {
      console.log("[getBarberAppointments] No appointments found for barberId:", barberId, "| dateFilter:", dateFilter);
    }

    return res.status(200).json({
      success: true,
      data: {
        pendingAppointments,
        awaitingPaymentAtShop,
        upcomingAppointments,
        summary: {
          totalAppointments,
          estimatedRevenue: Math.round(estimatedRevenue * 100) / 100,
        },
      },
    });
  } catch (error) {
    console.error("Barber appointments error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch barber appointments",
    });
  }
};

/**
 * PATCH /api/barber/appointments/:id/accept
 */
export const acceptAppointment = async (req, res) => {
  try {
    if (!req.barber?.id) {
      return res.status(401).json({ success: false, message: "Barber not authenticated" });
    }

    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid appointment id" });
    }

    const appointment = await prisma.appointment.findFirst({
      where: { id, barberId: req.barber.id },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (!isPending(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: "Appointment is not pending",
      });
    }

    await prisma.appointment.update({
      where: { id },
      data: { status: "confirmed" },
    });

    return res.status(200).json({
      success: true,
      message: "Appointment accepted",
      data: { id, status: "confirmed" },
    });
  } catch (error) {
    console.error("Accept appointment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to accept appointment",
    });
  }
};

/**
 * PATCH /api/barber/appointments/:id/decline
 */
export const declineAppointment = async (req, res) => {
  try {
    if (!req.barber?.id) {
      return res.status(401).json({ success: false, message: "Barber not authenticated" });
    }

    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid appointment id" });
    }

    const appointment = await prisma.appointment.findFirst({
      where: { id, barberId: req.barber.id },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (!isPending(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: "Appointment is not pending",
      });
    }

    await prisma.appointment.update({
      where: { id },
      data: {
        status: "rejected",
        cancellationReason: "Rejected by barber",
        cancelledAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Appointment rejected",
      data: { id, status: "rejected" },
    });
  } catch (error) {
    console.error("Decline appointment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to decline appointment",
    });
  }
};

/**
 * PATCH /api/barber/appointments/:id/mark-paid
 * Barber marks CONFIRMED + PAY_ON_SHOP as paid (cash at shop). Barber cannot change payment method.
 */
export const markAppointmentPaid = async (req, res) => {
  try {
    if (!req.barber?.id) {
      return res.status(401).json({ success: false, message: "Barber not authenticated" });
    }

    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid appointment id" });
    }

    const appointment = await prisma.appointment.findFirst({
      where: { id, barberId: req.barber.id },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (!isConfirmed(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: "Only confirmed appointments can be marked as paid",
      });
    }

    const paymentMethodUpper = String(appointment.paymentMethod || "").toUpperCase();
    if (paymentMethodUpper !== "PAY_ON_SHOP") {
      return res.status(400).json({
        success: false,
        message: "Only Pay at Shop appointments can be marked as paid here",
      });
    }

    const amount = Number(appointment.totalAmount) || 0;

    await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          appointmentId: appointment.id,
          userId: appointment.userId,
          amount,
          currency: "INR",
          paymentMethod: "PAY_ON_SHOP",
          paymentStatus: "completed",
          transactionId: "CASH_AT_SHOP_" + Date.now(),
          paymentGateway: "",
        },
      });
      await tx.appointment.update({
        where: { id },
        data: { status: "paid", paymentStatus: "paid" },
      });
    });

    return res.status(200).json({
      success: true,
      message: "Marked as paid",
      data: { id, status: "paid" },
    });
  } catch (error) {
    if (error?.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Payment already recorded for this appointment",
      });
    }
    console.error("Mark paid error:", error);
    return res.status(500).json({ success: false, message: "Failed to mark as paid" });
  }
};
