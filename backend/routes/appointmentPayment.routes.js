import express from "express";
import { createAppointmentAfterPayment } from "../controllers/appointmentPayment.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js"; // 🔒 ADD THIS

const router = express.Router();

// 🔒 LOGIN REQUIRED ROUTE
router.post(
  "/after-payment",
  authMiddleware,
  createAppointmentAfterPayment
);

export default router;
