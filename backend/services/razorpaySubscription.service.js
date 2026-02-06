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
 * Get or create the barber monthly plan (₹499/month).
 * Uses env RAZORPAY_BARBER_PLAN_ID if set; otherwise creates once and stores in env.
 */
export async function getOrCreateBarberPlan() {
  const planId = process.env.RAZORPAY_BARBER_PLAN_ID;
  if (planId && planId.trim()) {
    try {
      const razorpay = getRazorpay();
      await razorpay.plans.fetch(planId);
      return planId;
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[Razorpay] BARBER_PLAN_ID invalid or not found, creating plan:', e.message);
      }
    }
  }

  const razorpay = getRazorpay();
  const plan = await razorpay.plans.create({
    period: 'monthly',
    interval: 1,
    item: {
      name: 'Barber Platform Monthly',
      amount: BARBER_PLAN_AMOUNT_PAISE,
      currency: 'INR',
      description: 'Monthly subscription for barber platform access',
    },
  });
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Razorpay] Created plan:', plan.id, '- Set RAZORPAY_BARBER_PLAN_ID=', plan.id);
  }
  return plan.id;
}

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
export async function createBarberSubscription(customerId, planId, barberId) {
  const razorpay = getRazorpay();
  const nowSec = Math.floor(Date.now() / 1000);
  const trialEndSec = nowSec + TRIAL_DAYS * 24 * 60 * 60;

  const subscription = await razorpay.subscriptions.create({
    plan_id: planId,
    customer_id: customerId,
    total_count: 0, // infinite
    quantity: 1,
    start_at: trialEndSec,
    notes: { barberId: String(barberId) },
  });

  return {
    subscriptionId: subscription.id,
    trialEndsAt: new Date(trialEndSec * 1000),
  };
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
