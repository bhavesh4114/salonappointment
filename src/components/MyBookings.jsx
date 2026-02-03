import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const MyBookings = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const userName = user?.fullName || 'User'
  const userFirstName = userName.split(' ')[0]
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setLoading(false)
          return
        }
        const res = await fetch(`${API_BASE}/api/my-bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (data.success) {
          setBookings(data.bookings || [])
        } else {
          setError(data.message || 'Failed to load bookings')
        }
      } catch (err) {
        console.error('Error fetching bookings', err)
        setError('Failed to load bookings')
      } finally {
        setLoading(false)
      }
    }
    fetchMyBookings()
  }, [])

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const upcomingBookings = bookings.filter(
    (b) => new Date(b.appointmentDate) >= todayStart
  )
  const pastBookings = bookings.filter(
    (b) => new Date(b.appointmentDate) < todayStart
  )

  const getStatusLabel = (status) => {
    const s = String(status || '').toUpperCase()
    if (s === 'PENDING') return 'Waiting for barber confirmation'
    if (s === 'CONFIRMED') return 'Confirmed – Pay to confirm slot'
    if (s === 'PAID') return 'Paid'
    if (s === 'REJECTED') return 'Rejected'
    return status || '—'
  }

  const getPaymentStatusLabel = (paymentStatus) => {
    const s = String(paymentStatus || '').toUpperCase()
    if (s === 'PAID') return 'Paid'
    if (s === 'PENDING' || s === 'UNPAID') return 'Unpaid'
    return paymentStatus || '—'
  }

  const getPaymentMethodLabel = (method) => {
    const m = String(method || '').toUpperCase()
    if (m === 'PAY_ON_SHOP') return 'Pay at Shop'
    if (m === 'NET_BANKING') return 'Net Banking'
    if (m === 'CARD') return 'Card'
    if (m === 'UPI') return 'UPI'
    return method || '—'
  }

  const isConfirmed = (status) => String(status || '').toUpperCase() === 'CONFIRMED'

  const handlePayNow = (booking) => {
    const barber = booking.barber || {}
    const selectedServices = (booking.services || []).map((s) => ({
      serviceId: s.service?.id,
      id: s.service?.id,
      name: s.service?.name,
      price: s.service?.price ?? s.price,
      quantity: 1,
    })).filter((s) => s.serviceId)
    navigate('/payment', {
      state: {
        appointmentId: booking.id,
        barber,
        selectedServices,
        totalPrice: booking.totalAmount,
        selectedDate: booking.appointmentDate,
        selectedTime: booking.appointmentTime,
      },
    })
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content - header from UserLayout */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome, {userFirstName}!</h1>
          <p className="text-lg text-gray-600">Manage your upcoming and past grooming appointments.</p>
        </div>

        {/* Upcoming Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Upcoming</h2>
            <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
              {upcomingBookings.length} BOOKING{upcomingBookings.length !== 1 ? 'S' : ''}
            </span>
          </div>

          {loading ? (
            <p className="text-gray-500">Loading your bookings…</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : upcomingBookings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
              No upcoming bookings. Book a slot from a barber profile.
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => {
                const statusUpper = String(booking.status || '').toUpperCase()
                const showPayNow = isConfirmed(booking.status)
                const isRejected = statusUpper === 'REJECTED'
                return (
                  <div key={booking.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="flex">
                      <div className="w-48 h-48 flex-shrink-0 bg-gray-200 overflow-hidden">
                        <img
                          src={booking.barber?.image || 'https://images.unsplash.com/photo-1585747861815-2a94da1c3fd8?auto=format&fit=crop&w=800&q=80'}
                          alt={booking.barber?.fullName || 'Barber'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = 'https://images.unsplash.com/photo-1585747861815-2a94da1c3fd8?auto=format&fit=crop&w=800&q=80'
                          }}
                        />
                      </div>
                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div>
                          <span className={`inline-block px-2 py-1 text-xs font-semibold uppercase rounded mb-2 ${
                            statusUpper === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                            statusUpper === 'CONFIRMED' ? 'bg-teal-100 text-teal-700' :
                            statusUpper === 'PAID' ? 'bg-green-100 text-green-700' :
                            isRejected ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {getStatusLabel(booking.status)}
                          </span>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {(booking.services || []).map((s) => s.service?.name).filter(Boolean).join(', ') || '—'}
                          </h3>
                          <div className="flex items-center justify-between text-gray-600 mb-2">
                            <span>With {booking.barber?.fullName || '—'}</span>
                            <div className="text-right">
                              <div className="font-medium">{new Date(booking.appointmentDate).toDateString()}</div>
                              <div className="text-sm">{booking.appointmentTime}</div>
                            </div>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">₹{booking.totalAmount}</p>
                          {(booking.paymentStatus || booking.paymentMethod) && (
                            <div className="mt-2 text-sm text-gray-600 space-y-0.5">
                              <p>Payment Status: {getPaymentStatusLabel(booking.paymentStatus)}</p>
                              {booking.paymentMethod && (
                                <p>Payment Method: {getPaymentMethodLabel(booking.paymentMethod)}</p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-3 mt-4">
                          {showPayNow && (
                            <button
                              onClick={() => handlePayNow(booking)}
                              className="px-6 py-3 bg-teal-mint text-white rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center gap-2"
                            >
                              Pay Now
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                            </button>
                          )}
                          {!showPayNow && statusUpper === 'PENDING' && (
                            <p className="text-sm text-amber-600">Payment available after barber confirms.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Past Appointments Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Past Appointments</h2>
            <a href="#" className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1">
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          <div className="space-y-4">
            {pastBookings.map((appointment) => (

              <div key={appointment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-6">
                  {/* Left - Image */}
                <div className="w-24 h-24 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
  <img
    src={`http://localhost:5000/${appointment.services?.[0]?.service?.image}`}
    alt={appointment.services?.[0]?.service?.name}
    className="w-full h-full object-cover"
    loading="lazy"
    onError={(e) => {
      e.target.onerror = null
      e.target.src =
        'https://images.unsplash.com/photo-1585747861815-2a94da1c3fd8?auto=format&fit=crop&w=200&q=80'
    }}
  />
</div>




                  {/* Center - Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
  {appointment.services.map(s => s.service.name).join(", ")}
</h3>

                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        appointment.status === 'completed'
 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      With {appointment.barber.fullName} •{" "}
                      {new Date(appointment.appointmentDate).toDateString()}
                    </p>
                    <p className="text-lg font-semibold text-gray-900">₹{appointment.totalAmount}</p>
                    {(appointment.paymentStatus || appointment.paymentMethod) && (
                      <div className="mt-1 text-sm text-gray-600">
                        Payment Status: {getPaymentStatusLabel(appointment.paymentStatus)}
                        {appointment.paymentMethod && (
                          <> · Payment Method: {getPaymentMethodLabel(appointment.paymentMethod)}</>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right - Actions */}
                  <div className="flex items-center gap-3">
                    {appointment.status === 'completed'
 && !appointment.rated && (
                      <>
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                          Rate Professional
                        </button>
                        <button className="px-4 py-2 bg-teal-mint text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
                          Rebook
                        </button>
                      </>
                    )}
                    {appointment.status === 'completed'
 && appointment.rated && (
                      <>
                        <div className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium flex items-center gap-1">
                          <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {appointment.rating} Given
                        </div>
                        <button className="px-4 py-2 bg-teal-mint text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
                          Rebook
                        </button>
                      </>
                    )}
                    {appointment.status === 'CANCELLED' && (
                      <button className="px-4 py-2 bg-teal-mint text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
                        Book Again
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyBookings
