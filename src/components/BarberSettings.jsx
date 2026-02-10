import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, MessageCircle, Camera, Check, X, Save, Plus, ShieldCheck, Lock, Eye } from 'lucide-react'
import { addNewService, fetchMyServices, updateServiceIsActive } from '../api/barberService'
import { useBarberProfile } from '../hooks/useBarberProfile'
import { useAuth } from '../context/AuthContext'

const BarberSettings = () => {
  const navigate = useNavigate()
  const { logout, token: authToken } = useAuth()
  const [activeTab, setActiveTab] = useState('Profile')
  const [bioText, setBioText] = useState('Passionate master barber with over 12 years of experience specializing in classic fades, beard sculpting, and luxury hot towel shaves. I believe grooming is an art form and every client deserves a tailored experience that leaves them looking and feeling their absolute best.')
  
  // Services state
  const [services, setServices] = useState([])

  // Add Service API state
  const [addServiceLoading, setAddServiceLoading] = useState(false)
  const [addServiceError, setAddServiceError] = useState('')
  const [addServiceSuccess, setAddServiceSuccess] = useState('')
  const [bufferTime, setBufferTime] = useState(15)
  const [weekendPricing, setWeekendPricing] = useState(true)
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false)
 const [newService, setNewService] = useState({
  name: '',
  description: '',
  category: '',   // 👈 empty (better UX)
  gender: '',
  plan: '',
  price: 0,
  duration: 30,
  enabled: true
})

  const [serviceImageFile, setServiceImageFile] = useState(null)
  const [payoutFrequency, setPayoutFrequency] = useState('Daily')
  const [autoPayout, setAutoPayout] = useState(true)
  const [sameDayBooking, setSameDayBooking] = useState(true)
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: 'Alexander Hamilton',
    bankName: 'JP Morgan Chase',
    accountNumber: '1234567890',
    routingCode: 'CHASUS33'
  })
  const [isEditingBank, setIsEditingBank] = useState(false)

  // Load barber profile to ensure auth, and then fetch services
  const { barberProfile } = useBarberProfile()

  // Fetch services for logged-in barber
  const loadServices = async () => {
    try {
      const res = await fetchMyServices()
      if (res.success && Array.isArray(res.data)) {
        setServices(
          res.data.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            price: s.price,
            duration: s.duration,
            enabled: s.isActive,
            image: s.image
          }))
        )
      }
    } catch (error) {
      console.error('Failed to load services:', error)
      if (error.code === 'NO_TOKEN' || error.status === 401) {
        logout()
        navigate('/login', { replace: true })
      }
    }
  }

  // Initial load when component mounts (and when barberProfile becomes available)
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      loadServices()
    }
  }, [activeTab])


  const handleAddService = async () => {
    if (addServiceLoading) return

    setAddServiceError('')
    setAddServiceSuccess('')

    // Basic front-end validation
    if (!newService.name.trim()) {
      setAddServiceError('Service name is required')
      return
    }

    if (!newService.price || Number.isNaN(Number(newService.price))) {
      setAddServiceError('Price is required and must be a valid number')
      return
    }

    if (!newService.duration || Number.isNaN(Number(newService.duration))) {
      setAddServiceError('Duration is required and must be a valid number')
      return
    }

    if (!newService.category) {
  setAddServiceError('Please select category')
  return
}

if (!newService.gender) {
  setAddServiceError('Please select gender')
  return
}

if (!newService.plan) {
  setAddServiceError('Please select plan')
  return
}

   const payload = {
  name: newService.name.trim(),
  description: newService.description.trim(),

  category: newService.category, // 👈 dynamic
  gender: newService.gender,     // 👈 dynamic
  plan: newService.plan,         // 👈 dynamic

  duration: Number(newService.duration),
  price: Number(newService.price),
  imageFile: serviceImageFile || undefined,
  isActive: newService.enabled
}


    try {
      setAddServiceLoading(true)
      // Use token from localStorage at submit time so it's always current (context can be stale)
      const tokenToSend = localStorage.getItem('token') || authToken
      if (!tokenToSend) {
        setAddServiceError('Session expired or not authenticated. Please login as barber again.')
        setAddServiceLoading(false)
        return
      }
      const res = await addNewService(payload, tokenToSend)

      if (res.success && res.data) {
        setAddServiceSuccess(res.message || 'Service added successfully')

        // Refresh services from backend so UI shows real data
        await loadServices()

        // Reset form
        setNewService({
  name: '',
  description: '',
  category: '',
  gender: '',
  plan: '',
  price: 0,
  duration: 30,
  enabled: true
})

        setServiceImageFile(null)
        setIsAddServiceModalOpen(false) // ✅ ADD THIS
      } else {
        setAddServiceError(res.message || 'Failed to add service')
      }
    } catch (error) {
      if (error.status === 401 || error.code === 'NO_TOKEN') {
        setAddServiceError('Session expired or not authenticated. Please login as barber again.')
      } else {
        setAddServiceError(error.message || 'Something went wrong while adding the service.')
      }
    } finally {
      setAddServiceLoading(false)
    }
  }

  // Availability state
  const [availabilityDays, setAvailabilityDays] = useState([
    {
      key: 'monday',
      label: 'Monday',
      enabled: true,
      start: '09:00 AM',
      end: '05:00 PM',
      hasBreak: true,
      breakStart: '12:00',
      breakEnd: '13:00'
    },
    {
      key: 'tuesday',
      label: 'Tuesday',
      enabled: true,
      start: '09:00 AM',
      end: '05:00 PM',
      hasBreak: false,
      breakStart: '',
      breakEnd: ''
    },
    {
      key: 'wednesday',
      label: 'Wednesday',
      enabled: true,
      start: '09:00 AM',
      end: '05:00 PM',
      hasBreak: false,
      breakStart: '',
      breakEnd: ''
    },
    {
      key: 'thursday',
      label: 'Thursday',
      enabled: true,
      start: '09:00 AM',
      end: '08:00 PM',
      hasBreak: false,
      breakStart: '',
      breakEnd: ''
    },
    {
      key: 'friday',
      label: 'Friday',
      enabled: true,
      start: '10:00 AM',
      end: '10:00 PM',
      hasBreak: false,
      breakStart: '',
      breakEnd: ''
    },
    {
      key: 'saturday',
      label: 'Saturday',
      enabled: false,
      start: '09:00 AM',
      end: '05:00 PM',
      hasBreak: false,
      breakStart: '',
      breakEnd: ''
    },
    {
      key: 'sunday',
      label: 'Sunday',
      enabled: false,
      start: '09:00 AM',
      end: '05:00 PM',
      hasBreak: false,
      breakStart: '',
      breakEnd: ''
    }
  ])

  const toggleAvailabilityDay = (key) => {
    setAvailabilityDays(prev =>
      prev.map(day =>
        day.key === key ? { ...day, enabled: !day.enabled } : day
      )
    )
  }

  const toggleAvailabilityBreak = (key) => {
    setAvailabilityDays(prev =>
      prev.map(day =>
        day.key === key ? { ...day, hasBreak: !day.hasBreak } : day
      )
    )
  }

  const copyMondayToAll = () => {
    const monday = availabilityDays.find(d => d.key === 'monday')
    if (!monday) return
    setAvailabilityDays(prev =>
      prev.map(day =>
        day.key === 'monday'
          ? day
          : {
              ...day,
              enabled: monday.enabled,
              start: monday.start,
              end: monday.end,
              hasBreak: monday.hasBreak,
              breakStart: monday.breakStart,
              breakEnd: monday.breakEnd
            }
      )
    )
  }

  const tabs = ['Profile', 'Services', 'Availability', 'Payments']

  const bioCharCount = bioText.length
  const maxBioChars = 500

  return (
    <div className="p-8">
          {/* Top Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MessageCircle className="w-5 h-5 text-gray-600" />
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
                View Public Profile
              </button>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <div className="flex gap-8">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 px-1 font-medium transition-colors relative ${
                    activeTab === tab
                      ? 'text-gray-800'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-mint"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            {activeTab === 'Profile' && (
              <>
                {/* Section Title */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Public Profile</h2>
                  <p className="text-gray-600">This information will be displayed publicly on the marketplace.</p>
                </div>

            {/* Profile Photo Section */}
            <div className="flex items-start gap-6 mb-8 pb-8 border-b border-gray-200">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center border-2 border-white">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Profile Photo</h3>
                <p className="text-sm text-gray-500 mb-4">
                  We recommend an image of at least 400x400. PNG or JPG only.
                </p>
                <div className="flex items-center gap-4">
                  <button className="text-teal-mint hover:text-teal-600 font-medium text-sm">
                    Upload new photo
                  </button>
                  <button className="text-red-600 hover:text-red-700 font-medium text-sm">
                    Remove
                  </button>
                </div>
              </div>
            </div>

            {/* Form Fields - Two Column Grid */}
            <div className="space-y-6 mb-8">
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Marcus Valentino"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent bg-gray-50 text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue="marcus.v@groomingpremium.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent bg-gray-50 text-gray-800"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Mobile Number
                    </label>
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                      VERIFIED
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="tel"
                      defaultValue="+1 (555) 012-3456"
                      readOnly
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg bg-gray-50 text-gray-800"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Title
                  </label>
                  <input
                    type="text"
                    defaultValue="Senior Master Barber"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent bg-gray-50 text-gray-800"
                  />
                </div>
              </div>
            </div>

            {/* Professional Bio */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professional Bio
              </label>
              <div className="relative">
                <textarea
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  rows={6}
                  maxLength={maxBioChars}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent bg-gray-50 text-gray-800 resize-none"
                  placeholder="Tell clients about your experience, specialties, and what makes your service unique..."
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                  {bioCharCount}{' / '}{maxBioChars} characters
                </div>
              </div>
            </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                  <button className="text-gray-600 hover:text-gray-800 font-medium">
                    Cancel Changes
                  </button>
                  <button className="bg-teal-mint text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
                    Save Profile Details
                  </button>
                </div>
              </>
            )}

            {activeTab === 'Services' && (
              <>
                {/* Section Title */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Services & Pricing</h2>
                  <p className="text-gray-600">Configure your service menu, pricing, and appointment durations for clients to see.</p>
                </div>

                {/* Active Services Section */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Active Services</h3>
                    <button
                      onClick={() => {
  setAddServiceError('')
  setAddServiceSuccess('')
  setIsAddServiceModalOpen(true)
}}

                      className="bg-teal-mint text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Service
                    </button>
                  </div>
                  <div className="space-y-6">
                    
                    {Array.isArray(services) && services.length > 0 ? (
                      services.map((service) => {
                      const imageSrc =
                        service.image && service.image.startsWith('http')
                          ? service.image
                          : service.image
                          ? `http://localhost:5000${service.image}`
                          : 'https://via.placeholder.com/64x64?text=Svc'

                      return (
                        <div
                          key={service.id}
                          className={`p-6 border rounded-lg ${
                            service.enabled
                              ? 'border-gray-200 bg-white'
                              : 'border-gray-200 bg-gray-50 opacity-75'
                          }`}
                        >
                          <div className="flex items-start gap-6 mb-4">
                            {/* Service Image */}
                            <img
                              src={imageSrc}
                              alt={service.name}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                            {/* Service Info */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="text-lg font-bold text-gray-800 mb-1">{service.name}</h4>
                                  <p className="text-sm text-gray-600">{service.description}</p>
                                </div>
                                {/* Toggle Badge – persists isActive to backend so User side shows/hides service */}
                                <button
                                  onClick={async () => {
                                    const nextEnabled = !service.enabled
                                    const updatedServices = services.map(s =>
                                      s.id === service.id ? { ...s, enabled: nextEnabled } : s
                                    )
                                    setServices(updatedServices)
                                    try {
                                      await updateServiceIsActive(service.id, nextEnabled)
                                    } catch (err) {
                                      console.error('Failed to update service enabled state:', err)
                                      loadServices()
                                    }
                                  }}
                                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                                    service.enabled
                                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                  }`}
                                >
                                  {service.enabled ? 'ENABLED' : 'DISABLED'}
                                </button>
                              </div>
                            </div>
                          </div>
                          {/* Price and Duration Inputs */}
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price (INR ₹)

                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                                <input
                                  type="number"
                                  value={service.price}
                                  onChange={(e) => {
                                    const updatedServices = services.map(s =>
                                      s.id === service.id ? { ...s, price: parseFloat(e.target.value) || 0 } : s
                                    )
                                    setServices(updatedServices)
                                  }}
                                  disabled={!service.enabled}
                                  className={`w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent ${
                                    service.enabled
                                      ? 'bg-white text-gray-800'
                                      : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                  }`}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Duration (min)
                              </label>
                              <select
                                value={service.duration}
                                onChange={(e) => {
                                  const updatedServices = services.map(s =>
                                    s.id === service.id ? { ...s, duration: parseInt(e.target.value) } : s
                                  )
                                  setServices(updatedServices)
                                }}
                                disabled={!service.enabled}
                                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent ${
                                  service.enabled
                                    ? 'bg-white text-gray-800'
                                    : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                <option value={15}>15 mins</option>
                                <option value={30}>30 mins</option>
                                <option value={45}>45 mins</option>
                                <option value={60}>60 mins</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )
                    })  ): null}
                  </div>
                </div>

                {/* Global Preferences Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6">Global Preferences</h3>
                  <div className="space-y-6">
                    {/* Appointment Buffer Time */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                          Appointment Buffer Time
                        </label>
                        <p className="text-sm text-gray-600">
                          Time between appointments for cleaning and preparation.
                        </p>
                      </div>
                      <select
                        value={bufferTime}
                        onChange={(e) => setBufferTime(parseInt(e.target.value))}
                        className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent bg-white text-gray-800"
                      >
                        <option value={5}>5 mins</option>
                        <option value={10}>10 mins</option>
                        <option value={15}>15 mins</option>
                        <option value={30}>30 mins</option>
                      </select>
                    </div>

                    {/* Weekend Pricing */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                          Weekend Pricing
                        </label>
                        <p className="text-sm text-gray-600">
                          Automatically apply a 15% markup on Saturday and Sunday.
                        </p>
                      </div>
                      <button
                        onClick={() => setWeekendPricing(!weekendPricing)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-mint focus:ring-offset-2 ${
                          weekendPricing ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            weekendPricing ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Unsaved changes will be lost if you leave this page.</p>
                  <button className="bg-teal-mint text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Services
                  </button>
                </div>
              </>
            )}

            {activeTab === 'Availability' && (
              <>
                {/* Availability & Schedule Section */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Availability &amp; Schedule</h2>
                  <p className="text-gray-600">
                    Set your weekly working hours and booking preferences.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-8">
                  {/* Weekly Hours Card */}
                  <div className="col-span-2">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Weekly Hours</h3>
                        <button
                          onClick={copyMondayToAll}
                          className="text-sm font-medium text-teal-mint hover:text-teal-600"
                        >
                          Copy Monday to all
                        </button>
                      </div>

                      <div className="space-y-3">
                        {availabilityDays.map((day, index) => (
                          <div
                            key={day.key}
                            className="flex items-center justify-between rounded-lg px-4 py-3 bg-gray-50"
                          >
                            <div className="flex items-center gap-3 w-40">
                              <button
                                onClick={() => toggleAvailabilityDay(day.key)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-teal-mint focus:ring-offset-2 ${
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
                                  !day.enabled ? 'text-gray-400' : 'text-gray-800'
                                }`}
                              >
                                {day.label}
                              </span>
                            </div>

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

                                <div className="w-40 flex justify-end">
                                  {day.hasBreak ? (
                                    <div className="inline-flex items-center px-3 py-1 rounded-lg bg-teal-mint bg-opacity-10 text-xs font-medium text-teal-mint">
                                      {day.breakStart} – {day.breakEnd}
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => toggleAvailabilityBreak(day.key)}
                                      className="text-xs font-medium text-teal-mint hover:text-teal-600"
                                    >
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

                  {/* Booking Rules & Google Calendar */}
                  <div className="space-y-6">
                    {/* Booking Rules Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">Booking Rules</h3>

                      {/* Max bookings per day */}
                      <div className="mb-5">
                        <p className="text-sm font-medium text-gray-800 mb-1">Max bookings per day</p>
                        <p className="text-xs text-gray-500 mb-2">
                          Limit the total appointments you can take in 24 hours.
                        </p>
                        <input
                          type="number"
                          defaultValue={12}
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
                          type="button"
                          onClick={() => setSameDayBooking(!sameDayBooking)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-teal-mint focus:ring-offset-1 ${
                            sameDayBooking ? 'bg-teal-mint' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                              sameDayBooking ? 'translate-x-4' : 'translate-x-1'
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
                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent">
                          <option>2 hours notice</option>
                        </select>
                      </div>

                      {/* Info Note */}
                      <div className="rounded-lg border border-teal-mint bg-teal-mint bg-opacity-5 px-4 py-3 text-xs text-gray-700">
                        Changes to your availability will not affect existing appointments already
                        on your calendar.
                      </div>
                    </div>

                    {/* Google Calendar Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Google Calendar</h3>
                      <p className="text-xs text-gray-500 mb-4">
                        Sync your barber schedule with your personal calendar to avoid
                        double-bookings.
                      </p>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors">
                        Configure Sync
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'Payments' && (
              <>
                {/* Payment & Payouts Section */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment &amp; Payouts</h2>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600">
                      Manage your bank details and payout preferences securely.
                    </p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold gap-1">
                      <Check className="w-3 h-3" />
                      Status: Verified
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Verification Status */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">Verification Status</h3>
                        <p className="text-sm text-gray-600 max-w-xl">
                          Your identity and bank account have been successfully verified. You are ready to receive
                          payments.
                        </p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                      View Certificate
                    </button>
                  </div>

                  {/* Bank Details */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900">Bank Details</h3>
                      <button
                        type="button"
                        onClick={() => setIsEditingBank(!isEditingBank)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        {isEditingBank ? 'Done' : 'Edit Details'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Account Holder Name
                        </label>
                        <input
                          type="text"
                          value={bankDetails.accountHolderName}
                          onChange={(e) =>
                            setBankDetails({ ...bankDetails, accountHolderName: e.target.value })
                          }
                          readOnly={!isEditingBank}
                          disabled={!isEditingBank}
                          className={`w-full px-3 py-2 rounded-lg border text-sm text-gray-800 ${
                            isEditingBank
                              ? 'border-blue-300 bg-white'
                              : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          value={bankDetails.bankName}
                          onChange={(e) =>
                            setBankDetails({ ...bankDetails, bankName: e.target.value })
                          }
                          readOnly={!isEditingBank}
                          disabled={!isEditingBank}
                          className={`w-full px-3 py-2 rounded-lg border text-sm text-gray-800 ${
                            isEditingBank
                              ? 'border-blue-300 bg-white'
                              : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Account Number
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={bankDetails.accountNumber}
                            onChange={(e) =>
                              setBankDetails({ ...bankDetails, accountNumber: e.target.value })
                            }
                            readOnly={!isEditingBank}
                            disabled={!isEditingBank}
                            className={`w-full px-3 py-2 pr-10 rounded-lg border text-sm text-gray-800 ${
                              isEditingBank
                                ? 'border-blue-300 bg-white'
                                : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                            }`}
                          />
                          <button
                            type="button"
                            disabled
                            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 cursor-not-allowed"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          IFSC / Routing Code
                        </label>
                        <input
                          type="text"
                          value={bankDetails.routingCode}
                          onChange={(e) =>
                            setBankDetails({ ...bankDetails, routingCode: e.target.value })
                          }
                          readOnly={!isEditingBank}
                          disabled={!isEditingBank}
                          className={`w-full px-3 py-2 rounded-lg border text-sm text-gray-800 ${
                            isEditingBank
                              ? 'border-blue-300 bg-white'
                              : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payout Preferences */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Payout Preferences</h3>

                    {/* Payout Frequency */}
                    <div className="mb-6">
                      <p className="text-xs font-medium text-gray-600 mb-2">Payout Frequency</p>
                      <div className="inline-flex rounded-full border border-gray-200 bg-gray-50 overflow-hidden text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => setPayoutFrequency('Daily')}
                          className={`px-4 py-2 ${
                            payoutFrequency === 'Daily'
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-600'
                          }`}
                        >
                          Daily
                        </button>
                        <button
                          type="button"
                          onClick={() => setPayoutFrequency('Weekly')}
                          className={`px-4 py-2 ${
                            payoutFrequency === 'Weekly'
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-600'
                          }`}
                        >
                          Weekly
                        </button>
                        <button
                          type="button"
                          onClick={() => setPayoutFrequency('Monthly')}
                          className={`px-4 py-2 ${
                            payoutFrequency === 'Monthly'
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-600'
                          }`}
                        >
                          Monthly
                        </button>
                      </div>
                    </div>

                    {/* Auto Payout */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">Auto Payout</p>
                        <p className="text-xs text-gray-500 max-w-md">
                          Automatically transfer earnings to your bank account based on frequency.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAutoPayout(!autoPayout)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          autoPayout ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            autoPayout ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Footer actions */}
                    <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                      <button className="text-sm font-medium text-gray-600 hover:text-gray-800">
                        Discard Changes
                      </button>
                      <button className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        Save Preferences
                      </button>
                    </div>
                  </div>

                  {/* Security Footer */}
                  <div className="flex flex-col items-center justify-center text-center mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-2 text-gray-600 text-xs font-semibold uppercase tracking-wide">
                      <Lock className="w-4 h-4" />
                      <span>Secure &amp; Encrypted</span>
                    </div>
                    <p className="text-xs text-gray-500 max-w-xl mb-2">
                      Your financial data is encrypted and stored securely using industry-standard protocols.
                      We never share your full bank details with third parties.
                    </p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full border border-gray-300 text-xs text-gray-600">
                      PCI Compliant
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

      {/* Add Service Modal */}
      {isAddServiceModalOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-50"
            onClick={() => setIsAddServiceModalOpen(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Add New Service</h3>
                <button
                  onClick={() => setIsAddServiceModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Success and error messages */}
                {addServiceError && (
                  <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {addServiceError}
                  </div>
                )}
                {addServiceSuccess && (
                  <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                    {addServiceSuccess}
                  </div>
                )}

                {/* Service Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Name
                  </label>
                  <input
                    type="text"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    placeholder="e.g. Premium Haircut"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent bg-white text-gray-800"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    placeholder="Describe the service..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent bg-white text-gray-800 resize-none"
                  />
                </div>

{/* Category */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Category
  </label>
  <select
    value={newService.category}
    onChange={(e) =>
      setNewService({ ...newService, category: e.target.value })
    }
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-mint"
  >
    <option value="">Select Category</option>
    <option value="HAIRCUT">Haircut</option>
    <option value="BEARD">Beard</option>
    <option value="FACIAL">Facial</option>
    <option value="GROOMING">Grooming</option>
    <option value="KIDS">Kids</option>
    <option value="ELITE">Elite</option>
  </select>
</div>

{/* Gender */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Gender
  </label>
  <select
    value={newService.gender}
    onChange={(e) =>
      setNewService({ ...newService, gender: e.target.value })
    }
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-mint"
  >
    <option value="">Select Gender</option>
    <option value="MEN">Men</option>
    <option
  value="WOMEN"
  disabled={newService.category === 'BEARD'}
>
  Women
</option>

  </select>
</div>

{/* Plan */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Plan
  </label>
  <select
    value={newService.plan}
    onChange={(e) =>
      setNewService({ ...newService, plan: e.target.value })
    }
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-mint"
  >
    <option value="">Select Plan</option>
    <option value="PRIME">Prime</option>
    <option value="ROYALE">Royale</option>
  </select>
</div>

                {/* Price and Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={newService.price}
                        onChange={(e) =>
                          setNewService({
                            ...newService,
                            price: parseFloat(e.target.value) || 0
                          })
                        }
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent bg-white text-gray-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (min)
                    </label>
                    <select
                      value={newService.duration}
                      onChange={(e) =>
                        setNewService({
                          ...newService,
                          duration: parseInt(e.target.value)
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent bg-white text-gray-800"
                    >
                      <option value={15}>15 mins</option>
                      <option value={30}>30 mins</option>
                      <option value={45}>45 mins</option>
                      <option value={60}>60 mins</option>
                    </select>
                  </div>
                </div>

                {/* Service Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Image (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files && e.target.files[0]
                      setServiceImageFile(file || null)
                    }}
                    className="w-full text-sm text-gray-700 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                  />
                </div>

                {/* Enable Service Toggle */}
                <div className="flex items-center justify-between pt-2">
                  <label className="text-sm font-medium text-gray-700">
                    Enable Service
                  </label>
                  <button
                    onClick={() =>
                      setNewService({
                        ...newService,
                        enabled: !newService.enabled
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-mint focus:ring-offset-2 ${
                      newService.enabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        newService.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsAddServiceModalOpen(false)
                   setNewService({
  name: '',
  description: '',
  category: '',
  gender: '',
  plan: '',
  price: 0,
  duration: 30,
  enabled: true
})

                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddService}
                  className="bg-teal-mint text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={addServiceLoading}
                >
                  {addServiceLoading ? 'Adding...' : 'Add Service'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default BarberSettings

