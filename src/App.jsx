import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

import Homepage from './components/Homepage'
import ServiceListing from './components/ServiceListing'
import BarberListing from './components/BarberListing'
import BarberProfile from './components/BarberProfile'

import BarberDashboard from './components/BarberDashboard'
import BarberAppointments from './components/BarberAppointments'
import BarberAvailability from './components/BarberAvailability'
import BarberClients from './components/BarberClients'
import BarberEarnings from './components/BarberEarnings'
import BarberSettings from './components/BarberSettings'

import Login from './components/Login'
import Signup from './components/Signup'
import DateTimeSelection from './components/DateTimeSelection'
import Payment from './components/Payment'
import BookingConfirmation from './components/BookingConfirmation'
import MyBookings from './components/MyBookings'
import BarberRegistration from './components/BarberRegistration'
import Category from './components/Category'

import UserProtectedRoute from './components/UserProtectedRoute'
import BarberProtectedRoute from './components/BarberProtectedRoute'
import BarberLayout from './components/BarberLayout'
import UserLayout from './components/UserLayout'

// Admin module
import AdminLayout from './admin/layout/AdminLayout'
import AdminDashboard from './admin/pages/AdminDashboard'
import AdminUsers from './admin/pages/AdminUsers'
import AdminBarbers from './admin/pages/AdminBarbers'
import AdminServices from './admin/pages/AdminServices'
import AdminBookings from './admin/pages/AdminBookings'
import AdminFinance from './admin/pages/AdminFinance'
import AdminCMS from './admin/pages/AdminCMS'
import AdminReports from './admin/pages/AdminReports'
import AdminSettings from './admin/pages/AdminSettings'
import AdminRoles from './admin/pages/AdminRoles'
import AdminLogin from './admin/pages/AdminLogin'
import AdminProtectedRoute from './admin/AdminProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* ---------- PUBLIC ROUTES ---------- */}
          <Route path="/" element={<Homepage />} />
          <Route path="/services" element={<ServiceListing />} />

          {/* /barbers and /barber/:id use same header as dashboard via UserLayout */}
          <Route element={<UserLayout />}>
            <Route path="/barbers" element={<BarberListing />} />
            <Route path="/barber/:id" element={<BarberProfile />} />
          </Route>

          {/* Redirect /dashboard to home */}
          <Route path="/dashboard" element={<Navigate to="/" replace />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/barber/register" element={<BarberRegistration />} />
          <Route path="/booking" element={<DateTimeSelection />} />
          <Route path="/booking-confirmation/:appointmentId" element={<BookingConfirmation />} />

          <Route
            path="/offers"
            element={
              <div className="min-h-screen bg-white flex items-center justify-center">
                <h1 className="text-2xl font-bold text-gray-800">
                  Offers Page - Coming Soon
                </h1>
              </div>
            }
          />

          {/* ---------- USER PROTECTED ROUTES (same header via UserLayout) ---------- */}
          <Route element={<UserProtectedRoute><UserLayout /></UserProtectedRoute>}>
            <Route path="/user/dashboard" element={<MyBookings />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route
              path="/profile/edit"
              element={
                <div className="min-h-screen bg-white flex items-center justify-center">
                  <h1 className="text-2xl font-bold text-gray-800">
                    Edit Profile - Coming Soon
                  </h1>
                </div>
              }
            />
            <Route path="/payment" element={<Payment />} />
          </Route>

          {/* ---------- ADMIN ROUTES ---------- */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="barbers" element={<AdminBarbers />} />
            <Route path="permissions" element={<AdminRoles />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="finance" element={<AdminFinance />} />
            <Route path="cms" element={<AdminCMS />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* ---------- BARBER PROTECTED ROUTES ---------- */}
          <Route path="/barber" element={<BarberProtectedRoute><BarberLayout /></BarberProtectedRoute>}>
            <Route path="dashboard" element={<BarberDashboard />} />
            <Route path="appointments" element={<BarberAppointments />} />
            <Route path="availability" element={<BarberAvailability />} />
            <Route path="clients" element={<BarberClients />} />
            <Route path="earnings" element={<BarberEarnings />} />
            <Route path="settings" element={<BarberSettings />} />
          </Route>


        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
