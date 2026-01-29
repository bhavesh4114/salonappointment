import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
import Dashboard from './components/Dashboard'
import BarberRegistration from './components/BarberRegistration'
import Category from './components/Category'

import UserProtectedRoute from './components/UserProtectedRoute'
import BarberProtectedRoute from './components/BarberProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* ---------- PUBLIC ROUTES ---------- */}
          <Route path="/" element={<Homepage />} />
          <Route path="/services" element={<ServiceListing />} />
          <Route path="/barbers" element={<BarberListing />} />
          <Route path="/barber/:id" element={<BarberProfile />} />

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

          {/* ---------- USER PROTECTED ROUTES ---------- */}
          <Route
            path="/dashboard"
            element={
              <UserProtectedRoute>
                <Dashboard />
              </UserProtectedRoute>
            }
          />

          <Route
            path="/user/dashboard"
            element={
              <UserProtectedRoute>
                <MyBookings />
              </UserProtectedRoute>
            }
          />

          <Route
            path="/bookings"
            element={
              <UserProtectedRoute>
                <MyBookings />
              </UserProtectedRoute>
            }
          />

          <Route
            path="/my-bookings"
            element={
              <UserProtectedRoute>
                <MyBookings />
              </UserProtectedRoute>
            }
          />

          <Route
            path="/profile/edit"
            element={
              <UserProtectedRoute>
                <div className="min-h-screen bg-white flex items-center justify-center">
                  <h1 className="text-2xl font-bold text-gray-800">
                    Edit Profile - Coming Soon
                  </h1>
                </div>
              </UserProtectedRoute>
            }
          />

          <Route
            path="/payment"
            element={
              <UserProtectedRoute>
                <Payment />
              </UserProtectedRoute>
            }
          />

          {/* ---------- BARBER PROTECTED ROUTES ---------- */}
          <Route
            path="/barber/dashboard"
            element={
              <BarberProtectedRoute>
                <BarberDashboard />
              </BarberProtectedRoute>
            }
          />

          <Route
            path="/barber/appointments"
            element={
              <BarberProtectedRoute>
                <BarberAppointments />
              </BarberProtectedRoute>
            }
          />

          <Route
            path="/barber/availability"
            element={
              <BarberProtectedRoute>
                <BarberAvailability />
              </BarberProtectedRoute>
            }
          />

          <Route
            path="/barber/clients"
            element={
              <BarberProtectedRoute>
                <BarberClients />
              </BarberProtectedRoute>
            }
          />

          <Route
            path="/barber/earnings"
            element={
              <BarberProtectedRoute>
                <BarberEarnings />
              </BarberProtectedRoute>
            }
          />

          <Route
            path="/barber/settings"
            element={
              <BarberProtectedRoute>
                <BarberSettings />
              </BarberProtectedRoute>
            }
          />

        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
