import express from "express";
import { createBooking, createBookingRequest, getBookedSlots } from "../controllers/booking.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/booked-slots", getBookedSlots);
router.post("/request", protect, createBookingRequest);
router.post("/", protect, createBooking);
router.post("/create", protect, createBooking);

export default router;
