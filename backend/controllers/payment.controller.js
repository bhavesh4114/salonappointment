import {
  createPaymentOrder,
  verifyPaymentSignature,
  getRegistrationFeeInRupees,
  getRazorpayKeyId
} from '../services/paymentService.js';

/**
 * Create Razorpay payment order
 * POST /api/barber/create-payment
 */
export const createPaymentOrderController = async (req, res) => {
  try {
    const order = await createPaymentOrder();
    const razorpayKeyId = getRazorpayKeyId();

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount_in_rupees || order.amount / 100,
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
 */
export const verifyPaymentController = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'razorpay_order_id, razorpay_payment_id and razorpay_signature are required'
      });
    }

    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount: getRegistrationFeeInRupees(),
        currency: 'INR'
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify payment'
    });
  }
};
