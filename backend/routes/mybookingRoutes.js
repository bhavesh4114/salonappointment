import express from "express";
import { protect } from "../middleware/auth.js";
import { getMyBookings } from "../controllers/mybookingController.js";

const router = express.Router();

// GET MY BOOKINGS
router.get("/", protect, getMyBookings);

export default router;
