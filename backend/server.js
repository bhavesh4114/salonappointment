import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from './prisma/client.js';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import adminUsersRoutes from './routes/adminUsers.routes.js';
import adminBarbersRoutes from './routes/adminBarbers.routes.js';
import adminServicesRoutes from './routes/adminServices.routes.js';
import adminBookingsRoutes from './routes/adminBookings.routes.js';
import adminFinanceRoutes from './routes/adminFinance.routes.js';

// BARBER ROUTES (PRIVATE & AUTH)
import barberRegistrationRoutes from './routes/barber.js';          // register, login
import barberServiceRoutes from './routes/barberServiceRoutes.js';  // barber services
import barberAppointmentsRoutes from './routes/barberAppointments.routes.js';
import availabilityRoutes from './routes/availability.js';

// PUBLIC ROUTES
import barberRoutes from './routes/barbers.js'; // list / filter barbers
import serviceRoutes from './routes/services.js';
import appointmentRoutes from './routes/appointmentspaymentbooking.js';
import confirmAppointmentRoutes from './routes/confirmAppointment.js';
import mybookingRoutes from './routes/mybookingRoutes.js';
import bookingRoutes from './routes/booking.routes.js';

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
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
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

// AUTH
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// ADMIN (User, Barber, Services, Bookings & Finance Management)
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/admin/barbers', adminBarbersRoutes);
app.use('/api/admin/services', adminServicesRoutes);
app.use('/api/admin/bookings', adminBookingsRoutes);
app.use('/api/admin/finance', adminFinanceRoutes);

// 🔒 BARBER (PRIVATE – specific paths before parametric /:id)
// Order: appointments (earnings, clients, appointments) first, then services, then registration
app.use('/api/barber', (req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Barber] ${req.method} ${req.originalUrl}`);
  }
  next();
});
app.use('/api/barber', barberAppointmentsRoutes);
app.use('/api/barber', barberServiceRoutes);
app.use('/api/barber', barberRegistrationRoutes);
app.use('/api/availability', availabilityRoutes);

// 🌐 PUBLIC
app.use('/api/barbers', barberRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/appointments/confirm', confirmAppointmentRoutes);
app.use('/api/my-bookings', mybookingRoutes);
app.use('/api/bookings', bookingRoutes);

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
  if (process.env.NODE_ENV !== 'production') {
    console.log('📋 Barber API routes: GET /api/barber/appointments, /clients, /earnings; PATCH /api/barber/appointments/:id/accept, /decline; GET/POST /api/barber/services; GET /api/barber/clients, /earnings (also on registration router)');
  }
});
