import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from './prisma/client.js';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import barberRoutes from './routes/barbers.js';              // list / filter barbers
import barberRegistrationRoutes from './routes/barber.js';   // register, login, payment
import barberServiceRoutes from './routes/barberServiceRoutes.js';
import serviceRoutes from './routes/services.js';
import appointmentRoutes from './routes/appointmentspaymentbooking.js';
import confirmAppointmentRoutes from "./routes/confirmAppointment.js";
import availabilityRoutes from './routes/availability.js';
import mybookingRoutes from './routes/mybookingRoutes.js';
import barberAppointmentsRoutes from './routes/barberAppointments.routes.js';


// Load env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* =======================
   MIDDLEWARE
======================= */
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* =======================
   DATABASE
======================= */
prisma.$connect()
  .then(() => console.log('✅ Connected to PostgreSQL via Prisma'))
  .catch((error) => {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  });

/* =======================
   ROUTES
======================= */
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use('/api/barbers', barberRoutes);            // GET list / filter
app.use('/api/barber', barberRegistrationRoutes); // register, login, create-payment
app.use('/api/barber', barberServiceRoutes);      // add services
app.use("/api/appointments/confirm", confirmAppointmentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/my-bookings', mybookingRoutes);

app.use('/api/availability', availabilityRoutes);
app.use('/api/barber', barberAppointmentsRoutes);


/* =======================
   HEALTH CHECK
======================= */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Salon Appointment API is running',
    timestamp: new Date().toISOString()
  });
});

/* =======================
   404 HANDLER
======================= */
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

/* =======================
   ERROR HANDLER
======================= */
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

/* =======================
   START SERVER
======================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});
