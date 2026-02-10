import Razorpay from 'razorpay';
import prisma from '../prisma/client.js';

const BARBER_PLAN_AMOUNT_PAISE = 49900; // ₹499/month
const TRIAL_DAYS = 90;

let razorpayInstance = null;

const getRazorpay = () => {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error('Razorpay keys not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
    }
    razorpayInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return razorpayInstance;
};

/**
 * Create Razorpay customer for barber (no card stored).
 */
export async function createRazorpayCustomer(barber) {
  const razorpay = getRazorpay();
  const customer = await razorpay.customers.create({
    name: barber.fullName || 'Barber',
    contact: barber.mobileNumber || '',
    email: barber.email || undefined,
  });
  return customer.id;
}

/**
 * Create subscription with 90-day free trial (first charge at start_at).
 * Mandate is collected via Checkout with this subscription_id; no card stored by us.
 */
export async function createBarberSubscription(customerId, barberId) {
  // PLAN-LESS SUBSCRIPTION (TEMP GUARD): this is only called when a plan env is present.
  const customerIdTrimmed = (customerId || '').trim();
  if (!customerIdTrimmed) {
    throw new Error('Razorpay customer id is required to create a subscription.');
  }

  const razorpay = getRazorpay();
  const nowSec = Math.floor(Date.now() / 1000);
  const trialEndSec = nowSec + TRIAL_DAYS * 24 * 60 * 60;

  // NOTE: Razorpay still requires a plan_id on the server side.
  // We keep this function for when RAZORPAY_PLAN_ID is configured.
  const planId = (process.env.RAZORPAY_PLAN_ID || process.env.RAZORPAY_BARBER_PLAN_ID || '').trim();
  if (!planId) {
    throw new Error('Razorpay plan id is required to create a subscription when subscription flow is enabled.');
  }

  const payload = {
    plan_id: planId,
    customer_id: customerIdTrimmed,
    total_count: 0, // infinite
    quantity: 1,
    start_at: trialEndSec,
    notes: { barberId: String(barberId) },
  };

  try {
    const subscription = await razorpay.subscriptions.create(payload);
    return {
      subscriptionId: subscription.id,
      trialEndsAt: new Date(trialEndSec * 1000),
    };
  } catch (e) {
    const statusCode = e?.statusCode;
    const errBody = e?.error;
    const description = errBody?.description || e?.message || 'Unknown Razorpay error';
    console.error('[Razorpay] Subscription create failed. Full response:', JSON.stringify({ statusCode, error: errBody, message: e?.message }));
    if (statusCode === 400) {
      throw new Error(`Razorpay subscription failed: ${description}`);
    }
    throw new Error(`Razorpay subscription failed (${statusCode || 'unknown'}): ${description}`);
  }
}

/**
 * Link barber to Razorpay customer + subscription and set PENDING_MANDATE.
 */
export async function linkBarberSubscription(barberId, customerId, subscriptionId, trialEndsAt) {
  await prisma.barber.update({
    where: { id: barberId },
    data: {
      razorpayCustomerId: customerId,
      razorpaySubscriptionId: subscriptionId,
      trialEndsAt,
      subscriptionStatus: 'PENDING_MANDATE',
    },
  });
}

/**
 * Update barber subscription status (used by webhooks).
 */
export async function updateBarberSubscriptionStatus(razorpaySubscriptionId, status) {
  const allowed = ['TRIAL', 'ACTIVE', 'FAILED', 'CANCELLED'];
  if (!allowed.includes(status)) return;
  await prisma.barber.updateMany({
    where: { razorpaySubscriptionId },
    data: { subscriptionStatus: status },
  });
}

/**
 * Find barber by Razorpay subscription ID.
 */
export async function getBarberBySubscriptionId(razorpaySubscriptionId) {
  return prisma.barber.findFirst({
    where: { razorpaySubscriptionId },
  });
}
