import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './prisma/client.js';
import authRoutes from './routes/auth.js';
import appointmentRoutes from './routes/appointments.js';
import barberRoutes from './routes/barber.js';
import barberServiceRoutes from './routes/barberServiceRoutes.js';
import bookingRoutes from "./routes/booking.routes.js";
import appointmentPaymentRoutes from "./routes/appointmentPayment.routes.js";
import bookingPaymentRoutes from "./routes/bookingPayment.routes.js";
import adminServicesRoutes from './routes/adminServices.routes.js';
import adminBookingsRoutes from './routes/adminBookings.routes.js';
import adminFinanceRoutes from './routes/adminFinance.routes.js';
console.log("✅ bookingPaymentRoutes LOADED");
// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Salon Appointment Booking API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me'
      },
      appointments: {
        create: 'POST /api/appointments',
        list: 'GET /api/appointments',
        get: 'GET /api/appointments/:id'
      },
      barber: {
        register: 'POST /api/barber/register',
        categories: 'GET /api/barber/categories'
      }
    }
  });
});

// Database connection test
prisma.$connect()
  .then(() => {
    console.log('✅ Connected to PostgreSQL via Prisma');
  })
  .catch((error) => {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  });

// Routes
try {
  app.use('/api/auth', authRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/barber', barberRoutes);
  app.use('/api/barber', barberServiceRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/appointment-payment", appointmentPaymentRoutes);
  app.use("/api/payment", bookingPaymentRoutes);
  app.use('/api/admin/services', adminServicesRoutes);
  app.use('/api/admin/bookings', adminBookingsRoutes);
  app.use('/api/admin/finance', adminFinanceRoutes);


  console.log('✅ Routes registered:');
  console.log('  - /api/auth');
  console.log('  - /api/appointments');
  console.log('  - /api/barber');
  console.log('    • POST /api/barber/create-payment');
  console.log('    • GET  /api/barber/registration-fee');
  console.log('    • POST /api/barber/register');
  console.log('    • GET  /api/barber/categories');
  console.log('    • POST /api/barber/services');
  console.log('  - /api/admin/services');
  console.log('  - /api/admin/bookings');
  console.log('  - /api/admin/finance');
} catch (error) {
  console.error('❌ Error registering routes:', error);
  process.exit(1);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Salon Appointment API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API available at http://localhost:${PORT}`);
});
