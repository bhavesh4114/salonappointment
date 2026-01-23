import express from "express";
import {
  createBookingPaymentOrder,
  verifyBookingPayment
} from "../controllers/bookingPayment.controller.js";

import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// 🔒 Create Razorpay order
router.post(
  "/create-order",
  authMiddleware,
  createBookingPaymentOrder
);

// 🔒 Verify payment
router.post(
  "/verify-payment",
  authMiddleware,
  verifyBookingPayment
);

export default router;
