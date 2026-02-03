import React, { useState, useEffect, useCallback } from 'react'
import { MapPin, Scissors, Lightbulb } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  fetchBarberAppointments,
  acceptAppointment as apiAcceptAppointment,
  declineAppointment as apiDeclineAppointment,
} from '../api/barberAppointments'

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'

function formatDuration(mins) {
  if (mins == null) return '—'
  return `${mins}m`
}

function formatMoney(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '$0.00'
  return `$${Number(amount).toFixed(2)}`
}

function mapAppointmentToCard(appointment, options = {}) {
  const user = appointment.user || {}
  const services = appointment.services || []
  const serviceNames = services
    .map((s) => s.service?.name)
    .filter(Boolean)
  const serviceName = serviceNames.length ? serviceNames.join(', ') : '—'
  const duration = appointment.duration ?? services[0]?.service?.duration ?? 0

  return {
    id: appointment.id,
    clientName: user.fullName || 'Client',
    phone: user.mobileNumber || '',
    status: options.statusLabel ?? appointment.status,
    service: serviceName,
    time: appointment.appointmentTime || '—',
    duration: formatDuration(duration),
    address: options.address ?? 'At your shop',
    avatar: user.avatar || DEFAULT_AVATAR,
    earnings: formatMoney(appointment.totalAmount),
  }
}

const BarberAppointments = () => {
  const { token } = useAuth()
  const [activeFilter, setActiveFilter] = useState('All')
  const [pendingAppointments, setPendingAppointments] = useState([])
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [summary, setSummary] = useState({
    totalAppointments: 0,
    estimatedRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState(null)

  const loadAppointments = useCallback(async () => {
    const authToken = token ?? localStorage.getItem('token')
    if (!authToken) {
      setError('Please log in as barber to see appointments')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetchBarberAppointments(activeFilter, authToken)
      const appointments = res?.appointments ?? res?.data?.pendingAppointments?.concat(res?.data?.upcomingAppointments ?? []) ?? []
      console.log('[BarberAppointments] fetched appointments:', appointments)

      const pending = (Array.isArray(appointments) ? appointments : [])
        .filter((a) => (a?.status ?? '').toLowerCase() === 'pending')
        .map((a) =>
          mapAppointmentToCard(a, { statusLabel: 'New request', address: 'At your shop' })
        )
      const upcoming = (Array.isArray(appointments) ? appointments : [])
        .filter((a) => (a?.status ?? '').toLowerCase() === 'confirmed')
        .map((a) =>
          mapAppointmentToCard(a, { statusLabel: 'CONFIRMED', address: 'At your shop' })
        )

      const list = Array.isArray(appointments) ? appointments : []
      const totalAppointments = list.length
      const estimatedRevenue = list.reduce(
        (sum, a) => sum + Number(a?.totalAmount ?? 0),
        0
      )

      setPendingAppointments(pending)
      setUpcomingAppointments(upcoming)
      setSummary({ totalAppointments, estimatedRevenue })
    } catch (err) {
      setError(err?.message ?? 'Failed to load appointments')
      setPendingAppointments([])
      setUpcomingAppointments([])
      setSummary({ totalAppointments: 0, estimatedRevenue: 0 })
    } finally {
      setLoading(false)
    }
  }, [activeFilter, token])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  const handleAccept = async (requestId) => {
    setActionLoadingId(requestId)
    try {
      await apiAcceptAppointment(requestId)
      await loadAppointments()
    } catch (err) {
      setError(err.message || 'Failed to accept')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDecline = async (requestId) => {
    setActionLoadingId(requestId)
    try {
      await apiDeclineAppointment(requestId)
      await loadAppointments()
    } catch (err) {
      setError(err.message || 'Failed to decline')
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Appointments</h1>
              <p className="text-gray-600">Manage your schedule and client requests</p>
            </div>
            <div className="flex gap-2">
              {['All', 'Today', 'Tomorrow', 'This Week'].map((filter) => (
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

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">Loading appointments…</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-8">
              {/* New Requests */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-bold text-gray-800">New Requests</h2>
                  <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    {pendingAppointments.length} NEW
                  </span>
                </div>
                <div className="space-y-4">
                  {pendingAppointments.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-500">
                      No new requests for this period. When clients book with your shop, their requests will appear here.
                    </div>
                  ) : (
                    pendingAppointments.map((request) => (
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
                            {request.phone && (
                              <p className="text-sm text-gray-600 mb-1">
                                <a href={`tel:${request.phone}`} className="hover:text-teal-mint">{request.phone}</a>
                              </p>
                            )}
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
                                disabled={actionLoadingId === request.id}
                                className="flex-1 bg-teal-mint text-white py-2 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                              >
                                {actionLoadingId === request.id ? 'Accepting…' : 'Accept'}
                              </button>
                              <button
                                onClick={() => handleDecline(request.id)}
                                disabled={actionLoadingId === request.id}
                                className="flex-1 bg-white text-gray-700 py-2 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Upcoming */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Upcoming</h2>
                  <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    {upcomingAppointments.length} CONFIRMED
                  </span>
                </div>
                <div className="space-y-4">
                  {upcomingAppointments.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-500">
                      No upcoming appointments for this period. Confirmed bookings will appear here.
                    </div>
                  ) : (
                    upcomingAppointments.map((appointment) => (
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
                            {appointment.phone && (
                              <p className="text-sm text-gray-600 mb-1">
                                <a href={`tel:${appointment.phone}`} className="hover:text-teal-mint">{appointment.phone}</a>
                              </p>
                            )}
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
                                <p className="text-xs text-gray-500">Estimated {appointment.duration}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <MapPin className="w-4 h-4 text-teal-mint" />
                              <span className="text-sm">{appointment.address}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  TODAY'S SUMMARY
                </h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-3xl font-bold text-gray-800 mb-1">
                      {formatMoney(summary.estimatedRevenue)}
                    </p>
                    <p className="text-xs text-gray-500 uppercase">Estimated Revenue</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-3xl font-bold text-gray-800 mb-1">
                      {summary.totalAppointments}
                    </p>
                    <p className="text-xs text-gray-500 uppercase">Total Appointments</p>
                  </div>
                </div>
              </div>

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
                    <p className="text-sm font-bold text-gray-800">At your shop</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  QUICK TIPS
                </h3>
                <div className="bg-teal-50 rounded-lg p-4 border border-teal-100">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-teal-mint flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">
                      {upcomingAppointments.length === 0 && pendingAppointments.length === 0
                        ? 'When clients book with your shop (same barber you’re logged in as), their appointments will appear here. Use Settings to manage your availability.'
                        : 'Accept new requests quickly to keep your schedule full. You can always decline if the slot does not work.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BarberAppointments
