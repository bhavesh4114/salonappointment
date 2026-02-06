-- AlterTable (Razorpay Subscription: mandate + 90-day trial)
ALTER TABLE "barbers" ADD COLUMN "razorpayCustomerId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "barbers" ADD COLUMN "razorpaySubscriptionId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "barbers" ADD COLUMN "trialEndsAt" TIMESTAMP(3);
ALTER TABLE "barbers" ADD COLUMN "subscriptionStatus" TEXT NOT NULL DEFAULT 'PENDING_MANDATE';
