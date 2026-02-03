import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import prisma from '../prisma/client.js';

// Load environment variables
dotenv.config();

// Registration fee in rupees
export const REGISTRATION_FEE_RUPEES = 499;
export const REGISTRATION_FEE_PAISE = REGISTRATION_FEE_RUPEES * 100; // ₹499 = 49900 paise

// Initialize Razorpay instance
let razorpayInstance = null;

const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error('Razorpay keys not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
    }

    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  }
  return razorpayInstance;
};

/**
 * Create a payment order for barber registration using Razorpay
 * @returns {Promise<Object>} - Payment order details
 */
export const createPaymentOrder = async () => {
  return createPaymentOrderForAmount(REGISTRATION_FEE_PAISE, 'Barber Registration Fee');
};

/**
 * Create a Razorpay order for a given amount (booking or registration)
 * @param {number} amountPaise - Amount in paise
 * @param {string} receiptPurpose - Purpose for receipt/notes
 * @returns {Promise<Object>} - { id, amount (paise), currency, status, receipt }
 */
export const createPaymentOrderForAmount = async (amountPaise, receiptPurpose = 'Service Booking') => {
  const razorpay = getRazorpayInstance();
  const amount = Math.round(Number(amountPaise)) || REGISTRATION_FEE_PAISE;

  const options = {
    amount,
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
    notes: { purpose: receiptPurpose }
  };

  const razorpayOrder = await razorpay.orders.create(options);

  return {
    id: razorpayOrder.id,
    amount: razorpayOrder.amount,
    amount_in_rupees: razorpayOrder.amount / 100,
    currency: razorpayOrder.currency,
    status: razorpayOrder.status,
    receipt: razorpayOrder.receipt
  };
};

/**
 * Verify Razorpay payment signature (official flow).
 * Body format: order_id + "|" + payment_id
 * HMAC SHA256 with key_secret.
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature from frontend
 * @returns {boolean} - true if signature is valid
 */
export const verifyPaymentSignature = (orderId, paymentId, signature) => {
  if (!orderId || !paymentId || !signature) {
    return false;
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    console.error('[Razorpay] RAZORPAY_KEY_SECRET is not set');
    return false;
  }

  const body = `${String(orderId).trim()}|${String(paymentId).trim()}`;
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex');

  const received = String(signature).trim();
  const valid = expectedSignature === received;
  if (!valid && process.env.NODE_ENV !== 'production') {
    console.log('[Razorpay] Signature check:', { bodyLength: body.length, expectedLength: expectedSignature.length, receivedLength: received.length });
  }
  return valid;
};

/**
 * Record a successful payment in the database
 * @param {Object} params
 * @param {string} params.orderId
 * @param {string} params.paymentId
 * @param {number} params.amountPaise
 * @param {Object} params.tx - optional Prisma transaction client
 * @returns {Promise<Object>} - Payment record
 */
export const recordSuccessfulPayment = async ({ orderId, paymentId, amountPaise, tx = prisma }) => {
  return tx.barberPayment.upsert({
    where: { orderId },
    update: {
      paymentId,
      status: 'SUCCESS',
      amount: amountPaise
    },
    create: {
      orderId,
      paymentId,
      status: 'SUCCESS',
      amount: amountPaise,
      barberId: 0 // placeholder; will be linked on registration
    }
  });
};

/**
 * Get registration fee amount
 * @returns {number} - Registration fee in paise
 */
export const getRegistrationFee = () => REGISTRATION_FEE_PAISE;

/**
 * Get registration fee in rupees
 * @returns {number} - Registration fee in rupees
 */
export const getRegistrationFeeInRupees = () => REGISTRATION_FEE_RUPEES;

/**
 * Get Razorpay key ID (safe to expose to frontend)
 * @returns {string|null} - Razorpay key ID or null
 */
export const getRazorpayKeyId = () => process.env.RAZORPAY_KEY_ID || null;
