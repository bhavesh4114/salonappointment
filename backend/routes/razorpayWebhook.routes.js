import express from 'express';
import { handleRazorpaySubscriptionWebhook } from '../controllers/razorpaySubscriptionWebhook.controller.js';

const router = express.Router();

/**
 * Razorpay subscription webhook (subscription.authenticated, subscription.charged, subscription.payment_failed).
 * Must receive raw body for signature verification – mount with express.raw({ type: 'application/json' }).
 */
router.post('/subscription', handleRazorpaySubscriptionWebhook);

export default router;
