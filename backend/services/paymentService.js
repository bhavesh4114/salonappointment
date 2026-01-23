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
  const razorpay = getRazorpayInstance();

  // Create Razorpay order
  const options = {
    amount: REGISTRATION_FEE_PAISE, // Amount in smallest currency unit (paise)
    currency: 'INR',
    receipt: `receipt_barber_${Date.now()}`,
    notes: {
      purpose: 'Barber Registration Fee'
    }
  };

  const razorpayOrder = await razorpay.orders.create(options);

  return {
    id: razorpayOrder.id,
    amount: razorpayOrder.amount,
    amount_in_rupees: REGISTRATION_FEE_RUPEES,
    currency: razorpayOrder.currency,
    status: razorpayOrder.status,
    receipt: razorpayOrder.receipt
  };
};

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean} - true if signature is valid
 */
export const verifyPaymentSignature = (orderId, paymentId, signature) => {
  if (!orderId || !paymentId || !signature) {
    throw new Error('orderId, paymentId, and signature are required');
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error('Razorpay key secret is not configured');
  }

  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
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
