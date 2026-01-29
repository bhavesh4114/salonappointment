import express from "express";
import { getBarberAppointments } from "../controllers/barberAppointment.controller.js";
import { barberAuth } from "../middleware/auth.js";

const router = express.Router();

// 🔥 Barber ni badhi bookings
router.get(
  "/appointments",
  (req, res, next) => {
    console.log("🔥 barberbooking.routes HIT");
    next();
  },
  barberAuth,
  getBarberAppointments
);


export default router;
