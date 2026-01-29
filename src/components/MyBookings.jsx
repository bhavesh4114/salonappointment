import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from './Navbar'
import { useEffect, useState } from "react";

const MyBookings = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // Get user name from auth context
  const userName = user?.fullName || 'User'
  const userFirstName = userName.split(' ')[0]
const [bookings, setBookings] = useState([]);
const [loading, setLoading] = useState(true);
useEffect(() => {
  const fetchMyBookings = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/my-bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error("Error fetching bookings", err);
    } finally {
      setLoading(false);
    }
  };

  fetchMyBookings();
}, []);
const now = new Date();

const upcomingBookings = bookings.filter(
  (b) => new Date(b.appointmentDate) >= now
);

const pastBookings = bookings.filter(
  (b) => new Date(b.appointmentDate) < now
);

const booking = upcomingBookings.length > 0 ? upcomingBookings[0] : null;


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content */}
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
              {upcomingBookings.length} BOOKING

            </span>
          </div>

          {/* Upcoming Booking Card */}
          {booking && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="flex">
              {/* Left - Image */}
              <div className="w-80 h-80 flex-shrink-0 bg-gray-200 overflow-hidden">
                <img
                   src="https://images.unsplash.com/photo-1585747861815-2a94da1c3fd8?auto=format&fit=crop&w=800&q=80"
                  alt="Barber service"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = 'https://images.unsplash.com/photo-1585747861815-2a94da1c3fd8?auto=format&fit=crop&w=800&q=80'
                  }}
                />
              </div>

              {/* Right - Details */}
              <div className="flex-1 p-8 flex flex-col justify-between">
                <div>
                  <span className="inline-block px-2 py-1 bg-teal-50 text-teal-mint text-xs font-semibold uppercase rounded mb-3">
  COMING UP
</span>

<h3 className="text-2xl font-bold text-gray-900 mb-2">
  {booking.services.map(s => s.service.name).join(", ")}
</h3>

<div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-2 text-gray-600">
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
    <span>With {booking.barber.fullName}</span>
  </div>

  <div className="text-right text-gray-600">
    <div className="font-medium">
      {new Date(booking.appointmentDate).toDateString()}
    </div>
    <div className="text-sm">
      {booking.appointmentTime}
    </div>
  </div>
</div>


                  {/* Time Until Appointment */}
                  {/* <div className="bg-gray-100 rounded-lg p-4 mb-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">TIME UNTIL APPOINTMENT</p>
                    <div className="flex gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">{String(upcomingBooking.daysUntil).padStart(2, '0')}</div>
                        <div className="text-xs text-gray-500 mt-1">DAYS</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">{String(upcomingBooking.hoursUntil).padStart(2, '0')}</div>
                        <div className="text-xs text-gray-500 mt-1">HOURS</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">{String(upcomingBooking.minsUntil).padStart(2, '0')}</div>
                        <div className="text-xs text-gray-500 mt-1">MINS</div>
                      </div>
                    </div>
                  </div> */}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button className="flex-1 px-6 py-3 bg-teal-mint text-white rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Reschedule
                  </button>
                  <button className="flex-1 px-6 py-3 bg-white border border-gray-300 text-red-600 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel Booking
                  </button>
                </div>
              </div>
            </div>
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
