import express from "express";
import { confirmAppointment } from "../controllers/confirmAppointment.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// 🔒 Confirm appointment
router.put("/:id/confirm", protect, confirmAppointment);

export default router;
