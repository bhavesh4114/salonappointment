# Razorpay Subscription (Barber Platform)

## Overview

- **On barber registration**: Create Razorpay customer + subscription (90-day free trial, then ₹499/month). No card/UPI stored in DB.
- **Mandate**: Collected via Razorpay Checkout with `subscription_id`; RBI-compliant (card SI / UPI AutoPay).
- **Access**: Allowed only if `subscription_status` is `TRIAL` or `ACTIVE`; blocked if `FAILED` or `CANCELLED`.

## Environment Variables

Add to `.env`:

- `RAZORPAY_KEY_ID` – from Razorpay Dashboard → API Keys
- `RAZORPAY_KEY_SECRET` – from Razorpay Dashboard → API Keys
- `RAZORPAY_WEBHOOK_SECRET` – from Dashboard → Settings → Webhooks (create a webhook, copy secret)
- `RAZORPAY_BARBER_PLAN_ID` – (optional) Pre-created plan ID for ₹499/month; if unset, a plan is created on first registration

## Database Migration

From `backend/`:

```bash
npx prisma migrate deploy
```

Or in development:

```bash
npx prisma migrate dev --name add_barber_subscription
```

## Webhook Setup (Razorpay Dashboard)

1. **Settings → Webhooks** → Add New Webhook
2. **URL**: `https://your-domain.com/api/webhooks/razorpay/subscription`
3. **Events**: `subscription.authenticated`, `subscription.charged`, `subscription.payment_failed` (and optionally `payment.failed`)
4. Copy the **Webhook Secret** into `RAZORPAY_WEBHOOK_SECRET`

## Flow

1. **Registration**: Frontend calls `POST /api/barber/register-with-subscription` with barber details. Backend creates barber (status `PENDING_MANDATE`), Razorpay customer, and subscription (90-day trial); returns `subscriptionId` and `key_id`.
2. **Checkout**: Frontend opens Razorpay Checkout with `subscription_id`; user approves mandate (₹1/₹0 auth charge).
3. **Webhook `subscription.authenticated`**: Backend sets barber `subscription_status` = `TRIAL`.
4. **After trial**: Razorpay auto-charges ₹499/month. Webhook `subscription.charged` → status `ACTIVE`; `subscription.payment_failed` → status `FAILED` (access blocked).
5. **Login / barber routes**: If status is `FAILED` or `CANCELLED`, API returns 403 and frontend can redirect to registration/payment page.

## Security

- No card number, CVV, or expiry stored; Razorpay Vault handles mandate.
- Webhook signature verified with `RAZORPAY_WEBHOOK_SECRET` and raw body.
