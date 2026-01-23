import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * POST /api/payment/create-order
 * Used for SERVICE BOOKING payment
 */
export const createBookingPaymentOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // rupees → paisa
      currency: "INR",
      receipt: `booking_${Date.now()}`
    });

    res.json(order);
  } catch (error) {
    console.error("Create booking order error:", error);
    res.status(500).json({ message: "Order creation failed" });
  }
};

/**
 * POST /api/payment/verify-payment
 */
export const verifyBookingPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      return res.json({ success: true });
    }

    return res.status(400).json({ success: false });
  } catch (error) {
    console.error("Verify booking payment error:", error);
    res.status(500).json({ success: false });
  }
};
