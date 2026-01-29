import express from "express";
import { createAppointmentAfterPayment } from "../controllers/appointmentPayment.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post(
  "/after-payment",
  protect, // 🔒 logged-in user required
  createAppointmentAfterPayment
);

export default router;
