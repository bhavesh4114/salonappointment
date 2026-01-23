import React, { useState } from 'react'
import BarberSidebar from './BarberSidebar'

const days = [
  { key: 'monday', label: 'Monday', defaultStart: '09:00 AM', defaultEnd: '05:00 PM', hasBreak: true },
  { key: 'tuesday', label: 'Tuesday', defaultStart: '09:00 AM', defaultEnd: '05:00 PM', hasBreak: false },
  { key: 'wednesday', label: 'Wednesday', defaultStart: '09:00 AM', defaultEnd: '05:00 PM', hasBreak: false },
  { key: 'thursday', label: 'Thursday', defaultStart: '09:00 AM', defaultEnd: '08:00 PM', hasBreak: false },
  { key: 'friday', label: 'Friday', defaultStart: '10:00 AM', defaultEnd: '10:00 PM', hasBreak: false },
  { key: 'saturday', label: 'Saturday', defaultStart: '09:00 AM', defaultEnd: '05:00 PM', hasBreak: false },
  { key: 'sunday', label: 'Sunday', defaultStart: '09:00 AM', defaultEnd: '05:00 PM', hasBreak: false }
]

const BarberAvailability = () => {

  const [weeklyHours, setWeeklyHours] = useState(
    days.map((day, index) => ({
      ...day,
      enabled: index < 5, // Mon-Fri on, Sat/Sun off
      start: day.defaultStart,
      end: day.defaultEnd,
      breakEnabled: day.hasBreak && index === 0,
      breakStart: '12:00 PM',
      breakEnd: '01:00 PM'
    }))
  )

  const [maxBookingsPerDay, setMaxBookingsPerDay] = useState(12)
  const [sameDayBooking, setSameDayBooking] = useState(true)
  const [leadTime, setLeadTime] = useState('2 hours notice')

  const toggleDay = (key) => {
    setWeeklyHours(prev =>
      prev.map(day =>
        day.key === key ? { ...day, enabled: !day.enabled } : day
      )
    )
  }

  const copyMondayToAll = () => {
    const monday = weeklyHours.find(d => d.key === 'monday')
    if (!monday) return
    setWeeklyHours(prev =>
      prev.map(day =>
        day.key === 'monday'
          ? day
          : {
              ...day,
              enabled: monday.enabled,
              start: monday.start,
              end: monday.end,
              breakEnabled: monday.breakEnabled,
              breakStart: monday.breakStart,
              breakEnd: monday.breakEnd
            }
      )
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <BarberSidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64">
        <div className="p-8">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Availability &amp; Schedule</h1>
              <p className="text-gray-600 mt-1">
                Set your weekly working hours and booking preferences.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Discard
              </button>
              <button className="px-5 py-2.5 bg-teal-mint text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                Save Changes
              </button>
            </div>
          </div>

          {/* Main 2-column layout */}
          <div className="grid grid-cols-3 gap-8">
            {/* Weekly Hours Card */}
            <div className="col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Weekly Hours</h2>
                  <button
                    onClick={copyMondayToAll}
                    className="text-sm font-medium text-teal-mint hover:text-teal-600"
                  >
                    Copy Monday to all
                  </button>
                </div>

                <div className="space-y-3">
                  {weeklyHours.map((day, index) => (
                    <div
                      key={day.key}
                      className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                        day.enabled ? 'bg-gray-50' : 'bg-gray-50'
                      }`}
                    >
                      {/* Toggle + Day Label */}
                      <div className="flex items-center gap-3 w-40">
                        <button
                          onClick={() => toggleDay(day.key)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-mint focus:ring-offset-2 ${
                            day.enabled ? 'bg-teal-mint' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              day.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span
                          className={`text-sm font-medium ${
                            index >= 5 && !day.enabled ? 'text-gray-400' : 'text-gray-800'
                          }`}
                        >
                          {day.label}
                        </span>
                      </div>

                      {/* Time pickers or Closed */}
                      {day.enabled ? (
                        <>
                          <div className="flex items-center gap-2 flex-1 justify-center">
                            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent">
                              <option>{day.start}</option>
                            </select>
                            <span className="text-gray-400">—</span>
                            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent">
                              <option>{day.end}</option>
                            </select>
                          </div>

                          {/* Break / Add Break */}
                          <div className="w-40 flex justify-end">
                            {day.breakEnabled ? (
                              <div className="inline-flex items-center px-3 py-1 rounded-lg bg-teal-mint bg-opacity-10 text-xs font-medium text-teal-mint">
                                12:00 – 13:00
                              </div>
                            ) : (
                              <button className="text-xs font-medium text-teal-mint hover:text-teal-600">
                                ADD BREAK
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex justify-between items-center">
                          <span className="text-sm text-gray-400 italic">Closed</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking Rules Column */}
            <div className="space-y-6">
              {/* Booking Rules Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Booking Rules</h2>

                {/* Max bookings per day */}
                <div className="mb-5">
                  <p className="text-sm font-medium text-gray-800 mb-1">Max bookings per day</p>
                  <p className="text-xs text-gray-500 mb-2">
                    Limit the total appointments you can take in 24 hours.
                  </p>
                  <input
                    type="number"
                    value={maxBookingsPerDay}
                    onChange={e => setMaxBookingsPerDay(parseInt(e.target.value) || 0)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent"
                  />
                </div>

                {/* Same-day booking */}
                <div className="mb-5 flex items-center justify-between">
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-800 mb-1">Same-day booking</p>
                    <p className="text-xs text-gray-500">
                      Allow clients to book appointments for today.
                    </p>
                  </div>
                  <button
                    onClick={() => setSameDayBooking(!sameDayBooking)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-mint focus:ring-offset-2 ${
                      sameDayBooking ? 'bg-teal-mint' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        sameDayBooking ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Minimum lead time */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-800 mb-1">Minimum lead time</p>
                  <p className="text-xs text-gray-500 mb-2">
                    How much notice do you need before a booking?
                  </p>
                  <select
                    value={leadTime}
                    onChange={e => setLeadTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent"
                  >
                    <option>1 hour notice</option>
                    <option>2 hours notice</option>
                    <option>4 hours notice</option>
                    <option>24 hours notice</option>
                  </select>
                </div>

                {/* Info Note */}
                <div className="rounded-lg border border-teal-mint bg-teal-mint bg-opacity-5 px-4 py-3 text-xs text-gray-700">
                  Changes to your availability will not affect existing appointments already on your
                  calendar.
                </div>
              </div>

              {/* Google Calendar Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Google Calendar</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Sync your barber schedule with your personal calendar to avoid double-bookings.
                </p>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors">
                  Configure Sync
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BarberAvailability

