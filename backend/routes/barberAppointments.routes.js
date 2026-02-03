import express from "express";
import {
  getBarberAppointments,
  acceptAppointment,
  declineAppointment,
  markAppointmentPaid,
} from "../controllers/barberAppointment.controller.js";
import { getBarberClients } from "../controllers/barberClients.controller.js";
import { getBarberEarnings } from "../controllers/barberEarnings.controller.js";
import { barberAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/appointments", barberAuth, getBarberAppointments);
router.get("/clients", barberAuth, getBarberClients);
router.get("/earnings", barberAuth, getBarberEarnings);

router.patch("/appointments/:id/accept", barberAuth, acceptAppointment);
router.patch("/appointments/:id/decline", barberAuth, declineAppointment);
router.patch("/appointments/:id/mark-paid", barberAuth, markAppointmentPaid);

export default router;
