// barber register + booking payment
import {
  createPaymentOrder,
  createPaymentOrderForAmount,
  verifyPaymentSignature,
  getRegistrationFeeInRupees,
  getRazorpayKeyId
} from '../services/paymentService.js';

/**
 * Create Razorpay payment order
 * POST /api/barber/create-payment
 * Body: { amount } optional – amount in paise for booking; if omitted, uses registration fee
 * Returns: { success, orderId, amount (in paise for Razorpay), key } for booking flow
 */
export const createPaymentOrderController = async (req, res) => {
  try {
    const amountPaise = req.body && typeof req.body.amount === 'number' && req.body.amount > 0
      ? Math.round(req.body.amount)
      : null;

    const order = amountPaise
      ? await createPaymentOrderForAmount(amountPaise, 'Service Booking')
      : await createPaymentOrder();

    const razorpayKeyId = getRazorpayKeyId();

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency || 'INR',
      key: razorpayKeyId
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment order'
    });
  }
};

/**
 * Verify Razorpay payment signature
 * POST /api/barber/verify-payment
 * Body: razorpay_order_id, razorpay_payment_id, razorpay_signature (or camelCase equivalents)
 * Uses key_secret: HMAC SHA256(order_id + "|" + payment_id, key_secret)
 */
export const verifyPaymentController = async (req, res) => {
  try {
    const body = req.body || {};
    const orderId = body.razorpay_order_id ?? body.razorpayOrderId ?? '';
    const paymentId = body.razorpay_payment_id ?? body.razorpayPaymentId ?? '';
    const signature = body.razorpay_signature ?? body.razorpaySignature ?? '';

    if (process.env.NODE_ENV !== 'production') {
      console.log('Verify payment request:', { hasOrderId: !!orderId, hasPaymentId: !!paymentId, hasSignature: !!signature });
    }

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        message: 'razorpay_order_id, razorpay_payment_id and razorpay_signature are required'
      });
    }

    const isValid = verifyPaymentSignature(orderId, paymentId, signature);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('Payment verification success for order:', orderId);
    }

    res.json({
      success: true,
      paymentId,
      orderId,
      method: 'ONLINE',
      amount: body.amount ?? getRegistrationFeeInRupees(),
      currency: 'INR'
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment verification failed'
    });
  }
};
