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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/services" element={<ServiceListing />} />
          <Route path="/barbers" element={<BarberListing />} />
          <Route path="/barber/:id" element={<BarberProfile />} />
          <Route path="/barber/dashboard" element={<BarberDashboard />} />
          <Route path="/barber/appointments" element={<BarberAppointments />} />
          <Route path="/barber/availability" element={<BarberAvailability />} />
          <Route path="/barber/clients" element={<BarberClients />} />
          <Route path="/barber/earnings" element={<BarberEarnings />} />
          <Route path="/barber/settings" element={<BarberSettings />} />
          <Route path="/user/dashboard" element={<MyBookings />} />
          <Route path="/profile/edit" element={<div className="min-h-screen bg-white flex items-center justify-center"><h1 className="text-2xl font-bold text-gray-800">Edit Profile - Coming Soon</h1></div>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/barber/register" element={<BarberRegistration />} />
          <Route path="/booking" element={<DateTimeSelection />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/booking-confirmation" element={<BookingConfirmation />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/offers" element={<div className="min-h-screen bg-white flex items-center justify-center"><h1 className="text-2xl font-bold text-gray-800">Offers Page - Coming Soon</h1></div>} />
       

        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
