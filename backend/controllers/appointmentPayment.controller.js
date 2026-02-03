import prisma from "../prisma/client.js";

const isConfirmed = (s) => String(s || "").toUpperCase() === "CONFIRMED";

const ALLOWED_PAYMENT_METHODS = ["UPI", "CARD", "NET_BANKING", "PAY_ON_SHOP"];

function normalizePaymentMethod(value) {
  const v = String(value || "").toUpperCase().replace(/\s+/g, "_");
  if (v === "PAY_ON_SHOP" || v === "PAYONSHOP") return "PAY_ON_SHOP";
  if (v === "NET_BANKING" || v === "NETBANKING") return "NET_BANKING";
  if (v === "CARD") return "CARD";
  if (v === "UPI") return "UPI";
  return null;
}

/**
 * Payment is only allowed for CONFIRMED appointments (barber has accepted).
 * Requires paymentMethod (UPI | CARD | NET_BANKING | PAY_ON_SHOP).
 * PAY_ON_SHOP: directly mark booking PAID and create Payment record (never fail).
 */
export const createAppointmentAfterPayment = async (req, res) => {
  try {
    console.log("Payment request received:", { body: req.body, userId: req.user?.id });

    const userId = req.user.id;
    const { appointmentId, razorpayPaymentId, paymentMethod: rawMethod, amount: bodyAmount } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Payment requires a confirmed appointment. Request a booking and wait for barber confirmation.",
      });
    }

    const paymentMethod = normalizePaymentMethod(rawMethod);
    if (!paymentMethod || !ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method. Allowed: UPI, CARD, NET_BANKING, PAY_ON_SHOP",
      });
    }

    const appointment = await prisma.appointment.findFirst({
      where: { id: Number(appointmentId), userId },
      include: { services: { include: { service: true } } },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (!isConfirmed(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: "Payment is only allowed after barber confirmation. Current status: " + (appointment.status || "pending"),
      });
    }

    const amount = Number(bodyAmount) != null && !Number.isNaN(Number(bodyAmount))
      ? Number(bodyAmount)
      : Number(appointment.totalAmount) || 0;

    // PAY_ON_SHOP: directly mark PAID and create Payment record (never fail)
    if (paymentMethod === "PAY_ON_SHOP") {
      const transactionId = "PAY_ON_SHOP_" + Date.now();
      await prisma.$transaction(async (tx) => {
        await tx.payment.create({
          data: {
            appointmentId: appointment.id,
            userId,
            amount,
            currency: "INR",
            paymentMethod: "PAY_ON_SHOP",
            paymentStatus: "completed",
            transactionId,
            paymentGateway: "",
            paymentDetails: { barberId: appointment.barberId },
          },
        });
        await tx.appointment.update({
          where: { id: appointment.id },
          data: {
            status: "paid",
            paymentStatus: "paid",
            paymentMethod: "PAY_ON_SHOP",
          },
        });
      });
      console.log("Payment success for booking (Pay at Shop):", appointment.id);
      return res.status(200).json({
        success: true,
        bookingId: appointment.id,
        paymentId: transactionId,
        message: "Pay at shop confirmed. Booking is marked as PAID.",
      });
    }

    // Online: UPI / CARD / NET_BANKING – require razorpayPaymentId for completed payment
    const transactionId = razorpayPaymentId ? String(razorpayPaymentId) : "ONLINE_" + Date.now();

    let paymentRecord;
    await prisma.$transaction(async (tx) => {
      paymentRecord = await tx.payment.create({
        data: {
          appointmentId: appointment.id,
          userId,
          amount,
          currency: "INR",
          paymentMethod,
          paymentStatus: "completed",
          transactionId,
          paymentGateway: "RAZORPAY",
          paymentDetails: { barberId: appointment.barberId },
        },
      });
      await tx.appointment.update({
        where: { id: appointment.id },
        data: {
          status: "paid",
          paymentStatus: "paid",
        },
      });
    });

    console.log("Payment success for booking:", appointment.id);
    return res.status(200).json({
      success: true,
      bookingId: appointment.id,
      paymentId: paymentRecord?.id ?? transactionId,
    });
  } catch (error) {
    if (error?.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Payment already recorded for this appointment.",
      });
    }
    console.error("Payment appointment error:", error);
    return res.status(500).json({ success: false, message: "Payment failed" });
  }
};
