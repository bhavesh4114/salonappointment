import React from 'react'
import { Bell, Calendar, TrendingUp, Star } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import BarberSidebar from './BarberSidebar'

const BarberDashboard = () => {
const { user } = useAuth()

// ✅ STEP 3.1 — SAFETY CHECK (ADD THIS)
if (!user) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600 text-lg">
        Loading dashboard...
      </p>
    </div>
  )
}

// ✅ STEP 3.2 — user safe થયા પછી
const userName = user.fullName || 'Barber'

  const userFirstName = userName.split(' ')[0]

  const barberData = {
    name: userName,
    title: 'Professional Barber',
    image: user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    todayAppointments: 5,
    todayEarnings: 180.00,
    monthlyEarnings: 4200.00,
    rating: 4.9,
    growthPercentage: 12
  }

  const upcomingAppointments = [
    {
      id: 1,
      clientName: 'Alex Rivera',
      service: 'Premium Fade',
      time: '2:30 PM',
      duration: '45 min',
      date: '24',
      month: 'OCT',
      status: 'confirmed',
      cancelled: false
    },
    {
      id: 2,
      clientName: 'Michael Chen',
      service: 'Beard Sculpt & Shape',
      time: '3:45 PM',
      duration: '30 min',
      date: '24',
      month: 'OCT',
      status: 'confirmed',
      cancelled: false
    },
    {
      id: 3,
      clientName: 'Sarah Jenkins',
      service: 'Hair Coloring',
      status: 'Cancelled',
      time: '',
      duration: '',
      date: '24',
      month: 'OCT',
      cancelled: true
    },
    {
      id: 4,
      clientName: 'David Miller',
      service: 'Buzz Cut',
      time: '5:00 PM',
      duration: '20 min',
      date: '24',
      month: 'OCT',
      status: 'confirmed',
      cancelled: false
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <BarberSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64 min-h-screen">
        {/* Top Navigation */}
        <div className="bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between sticky top-0 z-30">

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userFirstName}!</h1>
            <p className="text-gray-600 mt-1">Here's what's happening today.</p>
          </div>

          <div className="flex items-center gap-6">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={24} className="text-gray-700" />
            </button>
            <div className="bg-teal-50 px-4 py-2 rounded-full">
              <span className="text-teal-600 font-semibold text-sm">October 24, 2023</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Today's Appointments */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar size={24} className="text-blue-600" />
                </div>
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded">+2 today</span>
              </div>
              <p className="text-gray-600 text-sm font-medium">Today's Appointments</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{barberData.todayAppointments}</p>
            </div>

            {/* Today's Earnings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp size={24} className="text-green-600" />
                </div>
              </div>
              <p className="text-gray-600 text-sm font-medium">Today's Earnings</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">${barberData.todayEarnings.toFixed(2)}</p>
            </div>

            {/* Monthly Earnings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp size={24} className="text-purple-600" />
                </div>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">{barberData.growthPercentage}% growth</span>
              </div>
              <p className="text-gray-600 text-sm font-medium">Monthly Earnings</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">${barberData.monthlyEarnings.toFixed(2)}</p>
            </div>

            {/* Overall Rating */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star size={24} className="text-yellow-600 fill-yellow-600" />
                </div>
                <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded">Top Rated</span>
              </div>
              <p className="text-gray-600 text-sm font-medium">Overall Rating</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{barberData.rating} ⭐</p>
            </div>
          </div>

          {/* Upcoming for Today */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Upcoming for Today</h2>
              <button className="text-teal-600 font-semibold hover:text-teal-700 transition-colors">View All</button>
            </div>

            <div className="space-y-4">
              {upcomingAppointments.map(appointment => (
                <div
                  key={appointment.id}
                  className={`bg-white rounded-2xl p-6 border border-gray-100 flex items-center justify-between transition-all ${
                    appointment.cancelled ? 'opacity-50 bg-gray-50' : 'hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-6 flex-1">
                    {/* Date Badge */}
                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-semibold uppercase">{appointment.month}</p>
                      <p className="text-2xl font-bold text-gray-900">{appointment.date}</p>
                    </div>

                    {/* Appointment Details */}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{appointment.clientName}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        ✂️ {appointment.service}
                        {!appointment.cancelled && (
                          <>
                            <span className="mx-2">📍</span>
                            <span>{appointment.time}({appointment.duration})</span>
                          </>
                        )}
                      </p>
                      {appointment.cancelled && (
                        <p className="text-sm text-gray-500 mt-1 font-medium">{appointment.status}</p>
                      )}
                    </div>
                  </div>

                  {/* Action Icons */}
                  <div className="flex items-center gap-3">
                    {!appointment.cancelled && (
                      <>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Card */}
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-8 border border-teal-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-teal-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">💡</span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Excellent Performance!</h3>
                <p className="text-gray-700 mt-1">You're in the top 5% of barbers in your area this week.</p>
              </div>
            </div>
            <button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors whitespace-nowrap ml-4">
              View Weekly Insights
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}

export default BarberDashboard
