import express from "express";
import {
  getBarberAppointments,
  acceptAppointment,
  declineAppointment,
} from "../controllers/barberAppointment.controller.js";
import { barberAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/appointments", barberAuth, getBarberAppointments);

router.patch("/appointments/:id/accept", barberAuth, acceptAppointment);
router.patch("/appointments/:id/decline", barberAuth, declineAppointment);

export default router;
