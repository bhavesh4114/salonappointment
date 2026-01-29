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

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });
    }

    const order = await razorpay.orders.create({
      amount, // already in paise
      currency: "INR",
      receipt: `booking_${Date.now()}`
    });

    return res.status(200).json({
      success: true,
      order
    });

  } catch (error) {
    console.error("Create booking order error:", error);
    return res.status(500).json({
      success: false,
      message: "Order creation failed"
    });
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
