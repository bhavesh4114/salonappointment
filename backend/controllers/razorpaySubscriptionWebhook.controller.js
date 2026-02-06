import crypto from 'crypto';
import { updateBarberSubscriptionStatus } from '../services/razorpaySubscription.service.js';

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

/**
 * Verify Razorpay webhook signature (raw body + x-razorpay-signature).
 * @param {Buffer|string} rawBody - Raw request body
 * @param {string} signature - x-razorpay-signature header
 * @returns {boolean}
 */
function verifyWebhookSignature(rawBody, signature) {
  if (!WEBHOOK_SECRET || !signature) return false;
  const body = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
  const expected = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(body)
    .digest('hex');
  return expected === signature;
}

/**
 * POST /api/webhooks/razorpay/subscription
 * Raw body required for signature verification.
 * Events: subscription.authenticated, subscription.charged, subscription.payment_failed
 */
export async function handleRazorpaySubscriptionWebhook(req, res) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.body; // Buffer when using express.raw()

    if (!rawBody || !verifyWebhookSignature(rawBody, signature)) {
      return res.status(400).json({ ok: false, error: 'Invalid signature' });
    }

    const payload = JSON.parse(
      typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8')
    );
    const event = payload.event;
    const subEntity = payload.payload?.subscription?.entity;
    const paymentEntity = payload.payload?.payment?.entity;

    const getSubscriptionId = () => {
      if (subEntity?.id) return subEntity.id;
      if (paymentEntity?.subscription_id) return paymentEntity.subscription_id;
      return null;
    };

    if (event === 'subscription.authenticated') {
      const subId = getSubscriptionId();
      if (subId) await updateBarberSubscriptionStatus(subId, 'TRIAL');
    } else if (event === 'subscription.charged') {
      const subId = getSubscriptionId();
      if (subId) await updateBarberSubscriptionStatus(subId, 'ACTIVE');
    } else if (event === 'subscription.payment_failed' || event === 'payment.failed') {
      const subId = getSubscriptionId();
      if (subId) await updateBarberSubscriptionStatus(subId, 'FAILED');
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Razorpay subscription webhook error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
