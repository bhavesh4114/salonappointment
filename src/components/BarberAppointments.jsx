import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Scissors, Lightbulb } from 'lucide-react'

const BarberAppointments = () => {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('Today')

  // Mock data for new requests
const newRequests = [
  {
    id: 1,
    clientName: 'Marcus Chen',
    status: 'New Client',
    service: 'Skin Fade & Line Up',
    time: '2:30 PM',
    duration: '45m',
    address: '742 Evergreen Terrace, Springfield',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
  },
  {
    id: 2,
    clientName: 'Liam Wilson',
    status: 'Regular • 12 Visits',
    service: 'Beard Sculpting',
    time: '4:15 PM',
    duration: '30m',
    address: 'Downtown Studio, Room 402',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
  }
]


  // Mock data for upcoming appointments
  const upcomingAppointments = [
    {
      id: 1,
      clientName: 'Jordan Peters',
      status: 'CONFIRMED',
      earnings: '$45.00',
      service: 'Classic Cut & Style',
      time: '11:00 AM',
      countdown: 'Starting in 15m',
      address: '32 Oak Ridge Drive, Highlands',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
    },
    {
      id: 2,
      clientName: 'Alex Rivera',
      status: 'CONFIRMED',
      earnings: '$60.00',
      service: 'Premium Fade & Beard',
      time: '1:30 PM',
      countdown: 'Starting in 2h 45m',
      address: '742 Evergreen Terrace, Springfield',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    },
    {
      id: 3,
      clientName: 'Michael Chen',
      status: 'CONFIRMED',
      earnings: '$35.00',
      service: 'Quick Trim',
      time: '3:00 PM',
      countdown: 'Starting in 4h 15m',
      address: 'Downtown Studio, Room 402',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
    }
  ]

  const handleAccept = (requestId) => {
    console.log('Accept request:', requestId)
    // Handle accept logic
  }

  const handleDecline = (requestId) => {
    console.log('Decline request:', requestId)
    // Handle decline logic
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="p-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Appointments</h1>
                <p className="text-gray-600">Manage your schedule and client requests</p>
              </div>
              <div className="flex gap-2">
                {['Today', 'Tomorrow', 'This Week'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeFilter === filter
                        ? 'bg-teal-mint text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {/* Center Column - Main Content */}
            <div className="col-span-2 space-y-8">
              {/* New Requests Section */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-bold text-gray-800">New Requests</h2>
                  <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    2 NEW
                  </span>
                </div>
                <div className="space-y-4">
                  {newRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-white rounded-lg shadow-sm border-l-4 border-blue-500 p-6"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={request.avatar}
                          alt={request.clientName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-800">{request.clientName}</h3>
                          </div>
                          <p className="text-sm text-gray-500 mb-3">{request.status}</p>
                          <div className="flex items-center gap-2 text-gray-700 mb-2">
                            <Scissors className="w-4 h-4 text-teal-mint" />
                            <span className="text-sm">{request.service}</span>
                          </div>
                          <div className="flex items-center gap-4 mb-3">
                            <div>
                              <p className="font-bold text-gray-800">{request.time}</p>
                              <p className="text-xs text-gray-500">Estimated {request.duration}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700 mb-4">
                            <MapPin className="w-4 h-4 text-teal-mint" />
                            <span className="text-sm">{request.address}</span>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleAccept(request.id)}
                              className="flex-1 bg-teal-mint text-white py-2 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleDecline(request.id)}
                              className="flex-1 bg-white text-gray-700 py-2 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Section */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Upcoming</h2>
                  <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    3 CONFIRMED
                  </span>
                </div>
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="bg-white rounded-lg shadow-sm border-l-4 border-green-500 p-6"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={appointment.avatar}
                          alt={appointment.clientName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-800">{appointment.clientName}</h3>
                          </div>
                          <p className="text-sm text-gray-500 mb-3">
                            {appointment.status} • Earnings: {appointment.earnings}
                          </p>
                          <div className="flex items-center gap-2 text-gray-700 mb-2">
                            <Scissors className="w-4 h-4 text-teal-mint" />
                            <span className="text-sm">{appointment.service}</span>
                          </div>
                          <div className="flex items-center gap-4 mb-3">
                            <div>
                              <p className="font-bold text-gray-800">{appointment.time}</p>
                              <p className="text-xs text-gray-500">{appointment.countdown}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <MapPin className="w-4 h-4 text-teal-mint" />
                            <span className="text-sm">{appointment.address}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Today's Summary */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  TODAY'S SUMMARY
                </h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-3xl font-bold text-gray-800 mb-1">$342.50</p>
                    <p className="text-xs text-gray-500 uppercase">Estimated Revenue</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-3xl font-bold text-gray-800 mb-1">8</p>
                    <p className="text-xs text-gray-500 uppercase">Total Appointments</p>
                  </div>
                </div>
              </div>

              {/* Location Preview */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  LOCATION PREVIEW
                </h3>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=200&fit=crop"
                    alt="Map"
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-4">
                    <p className="text-xs text-gray-500 uppercase mb-1">Next Destination</p>
                    <p className="text-sm font-bold text-gray-800">742 Evergreen Terrace</p>
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  QUICK TIPS
                </h3>
                <div className="bg-teal-50 rounded-lg p-4 border border-teal-100">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-teal-mint flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">
                      You have a gap between 11:45 AM and 1:00 PM. Perfect time for a break or a quick snack!
                    </p>
                  </div>
                </div>
                                      </div> {/* Right Sidebar */}
          </div>   {/* Grid */}
        </div>     {/* Padding */}
      </div>       {/* Page wrapper */}
    </div>
  )
}

export default BarberAppointments

