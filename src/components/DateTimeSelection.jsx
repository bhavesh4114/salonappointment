import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import UserHeader from './UserHeader'
import Navbar from './Navbar'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const DateTimeSelection = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const getNext7Days = () => {
    const days = []
    const today = new Date()

    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(today.getDate() + i)

      days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        date: date.getDate(),
        value: date.toISOString().split('T')[0] // YYYY-MM-DD
      })
    }

    return days
  }

  const barber = location.state?.barber || {}
  const selectedServices = location.state?.selectedServices || []
  const dates = getNext7Days()

  const [selectedDate, setSelectedDate] = useState(
    location.state?.selectedDate ?? dates[0]?.value
  )
  const [selectedTime, setSelectedTime] = useState(
    location.state?.selectedTime ?? '10:30 AM'
  )
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [bookedSlots, setBookedSlots] = useState([])
  const [isFetchingSlots, setIsFetchingSlots] = useState(false)
  const [slotsError, setSlotsError] = useState('')

  useEffect(() => {
    if (!barber.id || !selectedDate) return

    const controller = new AbortController()
    const loadBookedSlots = async () => {
      try {
        setIsFetchingSlots(true)
        setSlotsError('')
        const res = await fetch(
          `${API_BASE}/api/bookings/booked-slots?barberId=${barber.id}&date=${selectedDate}`,
          { signal: controller.signal }
        )
        if (!res.ok) {
          throw new Error('Failed to load booked slots')
        }
        const data = await res.json()
        setBookedSlots(Array.isArray(data.bookedTimes) ? data.bookedTimes : [])
      } catch (error) {
        if (error.name !== 'AbortError') {
          setBookedSlots([])
          setSlotsError('Could not load booked slots. Please try again.')
        }
      } finally {
        setIsFetchingSlots(false)
      }
    }

    loadBookedSlots()
    return () => controller.abort()
  }, [selectedDate, barber.id])

  useEffect(() => {
    if (selectedTime && bookedSlots.includes(selectedTime)) {
      setSelectedTime('')
    }
  }, [bookedSlots, selectedTime])

  const getTotalPrice = () => {
    return selectedServices?.reduce(
      (sum, service) => sum + service.price * service.quantity,
      0
    )
  }

  // Time slots
  const morningSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM']
  const afternoonSlots = ['12:30 PM', '01:00 PM', '02:00 PM', '03:30 PM', '04:00 PM', '04:30 PM']
  const eveningSlots = ['05:00 PM', '06:00 PM', '07:30 PM', '08:00 PM']

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleContinue = async () => {
    if (!selectedTime) {
      alert('Please select a time slot.')
      return
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/bookings/booked-slots?barberId=${barber.id}&date=${selectedDate}`
      )
      if (res.ok) {
        const data = await res.json()
        const latestBooked = Array.isArray(data.bookedTimes) ? data.bookedTimes : []
        if (latestBooked.includes(selectedTime)) {
          alert('This slot is already booked. Please select another time.')
          return
        }
      }
    } catch {
      // If re-check fails, let backend be the final gate.
    }

    const token = localStorage.getItem('token')
    if (!token) {
      setShowLoginModal(true)
      return
    }

    setSubmitting(true)
    setSubmitError('')
    try {
      const requestRes = await fetch(`${API_BASE}/api/bookings/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          barberId: barber.id,
          bookingDate: selectedDate,
          bookingTime: selectedTime,
          services: selectedServices.map((s) => ({ id: s.serviceId, serviceId: s.serviceId })),
        }),
      })
      const requestData = await requestRes.json().catch(() => ({}))
      if (!requestRes.ok) {
        setSubmitError(requestData.message || 'Failed to submit booking request.')
        return
      }
      navigate('/my-bookings', { replace: true })
    } catch (err) {
      setSubmitError(err?.message || 'Failed to submit booking request.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLoginModalConfirm = () => {
    setShowLoginModal(false)
    navigate('/login', {
      state: {
        from: '/booking',
        bookingState: { barber, selectedServices, selectedDate, selectedTime, totalPrice: getTotalPrice() }
      }
    })
  }

  const isBooked = (time) => bookedSlots.includes(time)

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated ? <UserHeader /> : <Navbar />}

      {/* Progress Indicator */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-teal-mint font-medium">Service</span>
            <span className="text-gray-400">→</span>
            <span className="text-teal-mint font-medium">Date & Time</span>
            <span className="text-gray-400">→</span>
            <span className="text-gray-500">Payment</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex gap-8">
          {/* Left Column - Date & Time Selection */}
          <div className="flex-1">
            {/* Select Date Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Date</h2>
              <div className="flex gap-3">
                {dates.map((d) => {
                  const isSelected = selectedDate === d.value

                  return (
                    <button
                      key={d.value}
                      onClick={() => setSelectedDate(d.value)}
                      className={`flex flex-col items-center justify-center px-4 py-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-teal-mint text-white border-teal-mint'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <span className="text-sm font-medium">{d.day}</span>
                      <span className="text-lg font-semibold mt-1">{d.date}</span>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white mt-1"></div>}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Select Time Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Select Time</h2>
              {isFetchingSlots && (
                <p className="text-sm text-gray-500 mb-4">Loading available slots...</p>
              )}
              {slotsError && (
                <p className="text-sm text-red-600 mb-4">{slotsError}</p>
              )}

              {/* Morning Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Morning</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {morningSlots.map((time) => {
                    const isSelected = selectedTime === time
                    const booked = isBooked(time)
                    return (
                      <button
                        key={time}
                        onClick={() => !booked && setSelectedTime(time)}
                        disabled={booked}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          booked
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : isSelected
                              ? 'bg-teal-mint text-white border-teal-mint'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                        title={booked ? 'Booked' : 'Available'}
                      >
                        {time}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Afternoon Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Afternoon</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {afternoonSlots.map((time) => {
                    const isSelected = selectedTime === time
                    const booked = isBooked(time)
                    return (
                      <button
                        key={time}
                        onClick={() => !booked && setSelectedTime(time)}
                        disabled={booked}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          booked
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : isSelected
                              ? 'bg-teal-mint text-white border-teal-mint'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                        title={booked ? 'Booked' : 'Available'}
                      >
                        {time}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Evening Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Evening</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {eveningSlots.map((time) => {
                    const isSelected = selectedTime === time
                    const booked = isBooked(time)
                    return (
                      <button
                        key={time}
                        onClick={() => !booked && setSelectedTime(time)}
                        disabled={booked}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          booked
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : isSelected
                              ? 'bg-teal-mint text-white border-teal-mint'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                        title={booked ? 'Booked' : 'Available'}
                      >
                        {time}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="w-96 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Booking Summary</h3>

              {/* Barber Info */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
                <img
                  src={barber.image || 'https://via.placeholder.com/60'}
                  alt={barber.fullName}
                  className="w-14 h-14 rounded-full object-cover"
                />

                <div>
                  <h4 className="font-semibold text-gray-900">{barber.fullName}</h4>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <p className="text-sm text-gray-500">{barber.shopName}</p>
                  </div>
                </div>
              </div>

              {/* Service Info */}
              {selectedServices?.map(service => (
                <div key={service.serviceId}
                  className="flex items-start justify-between mb-2"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {service.name}
                    </h4>

                    <p className="text-sm text-gray-500">
                      {service.duration} minutes · Qty {service.quantity}
                    </p>
                  </div>

                  <span className="text-lg font-semibold text-gray-900">
                    ₹{service.price * service.quantity}
                  </span>
                </div>
              ))}

              {/* Selected Slot */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Selected Slot</p>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-teal-mint">
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>

                  <p className="text-sm font-medium text-teal-mint">{selectedTime || 'Select a time'}</p>
                </div>
              </div>

              {/* Total */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Total</span>
                  <span className="text-xl font-bold text-teal-mint">  ₹{getTotalPrice()}</span>
                </div>
              </div>

              {submitError && (
                <p className="text-sm text-red-600 mb-3 text-center">{submitError}</p>
              )}
              {/* Submit Request Button (no payment at this stage) */}
              <button
                onClick={handleContinue}
                disabled={submitting}
                className="w-full px-6 py-3 bg-teal-mint text-white rounded-lg hover:opacity-90 transition-opacity font-medium mb-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting…' : 'Submit booking request'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <p className="text-xs text-gray-500 text-center mb-4">You won&apos;t be charged yet. Barber will confirm first.</p>

              {/* Cancellation Policy */}
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-teal-mint flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Free cancellation up to 24 hours before your appointment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login required modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowLoginModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <p className="text-gray-800 font-medium mb-4">Please login to continue booking.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleLoginModalConfirm}
                className="flex-1 px-4 py-2 bg-teal-mint text-white rounded-lg font-medium hover:opacity-90"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DateTimeSelection
