import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'



const BookingConfirmation = () => {
  const navigate = useNavigate()
const { appointmentId } = useParams()

const [booking, setBooking] = useState(null)
useEffect(() => {
  const fetchBooking = async () => {
    const res = await fetch(
      `http://localhost:5000/api/appointments/${appointmentId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    )

    const data = await res.json()
    if (data.success) {
      setBooking(data.appointment)
    }
  }

  fetchBooking()
}, [appointmentId])
if (!booking) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      Loading booking details...
    </div>
  )
}


  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-mint flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-gray-800">BarberPro</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-700 hover:text-gray-900 text-sm">Explore</a>
            <a href="#" className="text-gray-700 hover:text-gray-900 text-sm">Barbers</a>
            <a href="#" className="text-gray-700 hover:text-gray-900 text-sm">Help</a>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Confirmation Icon & Message */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-12 h-12 text-teal-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Booking Confirmed!</h1>
          <p className="text-lg text-gray-600 mb-2">
            Your grooming session is all set. Check your email for full details.
          </p>
          <p className="text-sm text-gray-500">  Booking ID: #{booking.id}</p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex gap-6 items-start">
            {/* Left Side - Barber Info */}
            <div className="flex-1">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">PROFESSIONAL BARBER</p>
              <div className="flex items-start gap-4 mb-6">
              <img
  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80"
  alt="Alex Rivera"
  className="w-16 h-16 rounded-full object-cover"
/>


                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{booking.barber.fullName}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>4.9 (124 reviews)</span>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-teal-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">{new Date(booking.appointmentDate).toDateString()} • {booking.appointmentTime}
</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-teal-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-700">{booking.barber.shopAddress}</span>
                </div>
              </div>
<div className="mt-4">
  <p className="text-sm font-semibold mb-2">Services</p>

  <ul className="list-disc ml-5 text-gray-700">
    {booking.services.map((s) => (
      <li key={s.id}>
        {s.service.name} – ₹{s.price}
      </li>
    ))}
  </ul>

  <p className="mt-3 font-bold">
    Total Amount: ₹{booking.totalAmount}
  </p>
</div>

              {/* Add to Google Calendar */}
              <a href="#" className="inline-flex items-center gap-2 text-teal-mint hover:underline text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Add to Google Calendar
              </a>
            </div>

            {/* Right Side - Salon Image */}
            <div className="w-64 h-64 flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1585747861815-2a94da1c3fd8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
                alt="Barbershop interior"
                className="w-full h-full rounded-lg object-cover"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = 'https://images.unsplash.com/photo-1560253023-3ec5ef5024f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
                }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mb-6">
          <button
            onClick={() => navigate('/bookings')}
            className="px-8 py-3 bg-teal-mint text-white rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            View My Bookings
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Home
          </button>
        </div>

        {/* Download Receipt Link */}
        <div className="text-center mb-8">
          <a href="#" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Receipt (PDF)
          </a>
        </div>

        {/* Support Text */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">
            Need help with your booking?{' '}
            <a href="#" className="text-teal-mint hover:underline">Contact Support</a>
            {' '}or visit our{' '}
            <a href="#" className="text-teal-mint hover:underline">Help Center</a>.
          </p>
        </div>
      </div>
    </div>
  )
}

export default BookingConfirmation
