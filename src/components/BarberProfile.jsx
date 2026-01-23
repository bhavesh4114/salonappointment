import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const BarberProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [selectedServices, setSelectedServices] = useState([])
  const [activeTab, setActiveTab] = useState('About')

const [barber, setBarber] = useState(null)
const [loading, setLoading] = useState(true)
useEffect(() => {
fetch(`http://localhost:5000/api/barbers/${id}`)

    .then(res => res.json())
    .then(data => {
      setBarber(data.barber)
      setLoading(false)
    })
    .catch(err => {
      console.error(err)
      setLoading(false)
    })
}, [id])

 const handleAddService = (service) => {
  setSelectedServices(prev => {
    const existing = prev.find(s => s.serviceId === service.id)

    if (existing) {
      return prev.map(s =>
        s.serviceId === service.id
          ? { ...s, quantity: s.quantity + 1 }
          : s
      )
    }

    return [
      ...prev,
      {
        serviceId: service.id,     // ✅ IMPORTANT
        name: service.name,
        price: service.price,      // ✅ PRICE FIX
        duration: service.duration,
        barberId: barber?.id,
        quantity: 1
      }
    ]
  })
}



const handleRemoveService = (serviceId) => {
  setSelectedServices(prev =>
    prev.filter(s => s.serviceId !== serviceId)
  )
}

  const getTotalPrice = () => {
    return selectedServices.reduce((sum, service) => sum + (service.price * service.quantity), 0)
  }
/* ✅ ADD THIS BLOCK HERE */
if (loading) {
  return <p className="text-center mt-10">Loading barber...</p>
}

if (!barber) {
  return <p className="text-center mt-10">Barber not found</p>
}
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-mint flex items-center justify-center cursor-pointer" onClick={() => navigate('/')}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-gray-800 cursor-pointer" onClick={() => navigate('/')}>BarberPro</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-700 hover:text-gray-900 text-sm">Find Barbers</a>
              <a href="#" className="text-gray-700 hover:text-gray-900 text-sm">Special Offers</a>
              <a href="#" className="text-gray-700 hover:text-gray-900 text-sm">My Bookings</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search services..."
                className="px-4 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-mint w-48"
              />
              <svg className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button className="px-4 py-2 bg-teal-mint text-white rounded-lg hover:opacity-90 text-sm font-medium">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Profile Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start gap-6">
            <img
  src={barber.image || 'https://via.placeholder.com/150'}
  alt={barber.fullName}
  className="w-24 h-24 rounded-full object-cover flex-shrink-0"
/>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {barber.fullName}

                </h1>
                {/* {barber.verified && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                    VERIFIED
                  </span>
                )} */}
                <button className="ml-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">
                  Share Profile
                </button>
              </div>
              {/* <p className="text-gray-600 mb-3">{barber.title}</p>
              <div className="flex items-center gap-6 text-sm">
                <span className="flex items-center gap-1">
                  <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {barber.rating} ({barber.reviewCount}+ reviews)
                </span>
                <span className="text-gray-600">{barber.experience ?? 0}+ Years Experience</span>
              </div> */}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('About')}
              className={`pb-3 px-1 text-sm font-medium transition-colors ${
                activeTab === 'About'
                  ? 'text-teal-mint border-b-2 border-teal-mint'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab('Services')}
              className={`pb-3 px-1 text-sm font-medium transition-colors ${
                activeTab === 'Services'
                  ? 'text-teal-mint border-b-2 border-teal-mint'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Services
            </button>
            <button
              onClick={() => setActiveTab('Reviews')}
              className={`pb-3 px-1 text-sm font-medium transition-colors ${
                activeTab === 'Reviews'
                  ? 'text-teal-mint border-b-2 border-teal-mint'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Reviews
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex gap-8">
          {/* Left Column */}
          <div className="flex-1 space-y-8">
            {/* About Section */}
            {activeTab === 'About' && (
              <>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
  About {barber.fullName}
</h2>

                  <p className="text-gray-600 leading-relaxed mb-6">
                    {barber.description || 'Professional and verified barber'}

                  </p>

                  {/* Expertise */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      EXPERTISE
                    </h3>
                    <div className="flex flex-wrap gap-2">
                     {Array.isArray(barber.categories) &&
  barber.categories.map((c, idx) => (
    <span
      key={idx}
      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
    >
      {c.category.name}
    </span>
))}


                    </div>
                  </div>

                  {/* Hygiene & Safety Standards */}
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <svg className="w-6 h-6 text-teal-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Hygiene & Safety Standards
                      </h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-teal-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-700">Sanitised Tools</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-teal-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-700">Masked Professional</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-teal-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-700">Single-use Capes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Services Section */}
            {activeTab === 'Services' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Services Offered</h2>
                  <span className="text-sm text-gray-500">
    {barber.services?.length || 0} services

</span>

                </div>

                {(!barber.services || barber.services.length === 0) && (
  <p className="text-gray-500">No services available</p>
)}
{Array.isArray(barber.services) && barber.services.map(service => (


  <div
    key={service.id}
    className="bg-white rounded-lg border border-gray-200 p-6 mb-4"
  >
    <h4 className="text-lg font-semibold text-gray-900 mb-2">
      {service.name}
    </h4>

    <p className="text-sm text-gray-600 mb-3">
      {service.description || 'Professional service'}
    </p>

    <div className="flex items-center gap-4 text-sm text-gray-500">
      <span>{service.duration} mins</span>
      <span className="text-lg font-bold text-teal-mint">
        ₹{service.price}
      </span>
    </div>

    <button
      onClick={() => handleAddService(service)}
      className="mt-4 px-6 py-2 bg-teal-mint text-white rounded-lg"
    >
      Add
    </button>
  </div>
))}

              </div>
            )}

            {/* Reviews Section */}
            {/* {activeTab === 'Reviews' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Customer Reviews</h2>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{barber.rating}</div>
                    <div className="text-sm text-gray-600">{barber.reviewCount} reviews</div>
                  </div>
                </div>

                <div className="space-y-6">
                  {barber.reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-start gap-4">
                        <img
                          src={review.avatar}
                          alt={review.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{review.name}</h4>
                              <p className="text-xs text-gray-500">{review.date}</p>
                            </div>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-6">
                  <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">
                    View all {barber.reviewCount} reviews
                  </button>
                </div>
              </div>
            )} */}
          </div>

          {/* Right Column - Booking Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-4 space-y-6">
              {/* Booking Summary */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Summary</h3>
                <p className="text-sm text-gray-500 mb-4">Select services to proceed.</p>

                {selectedServices.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-8 text-center mb-4">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <p className="text-sm text-gray-500">No services selected yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3 mb-4">
                    {selectedServices.map((service) => (
                       <div key={service.serviceId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{service.name}</p>
                          <p className="text-xs text-gray-500">Qty: {service.quantity} × ₹{service.price}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveService(service.serviceId)}

                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-semibold text-gray-900">₹{getTotalPrice().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <button
  disabled={selectedServices.length === 0}
  onClick={() =>
    navigate('/booking', {
      state: {
        barber,
        selectedServices,
        totalPrice: getTotalPrice()
      }
    })
  }
  className={`w-full mb-4 px-4 py-3 rounded-lg transition-opacity flex items-center justify-center gap-2 text-sm font-medium
    ${selectedServices.length === 0
      ? 'bg-gray-300 cursor-not-allowed'
      : 'bg-teal-mint text-white hover:opacity-90'}
  `}
>

                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Select Date & Time
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

              </div>

              {/* Location */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
                <div className="rounded-lg h-48 mb-4 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=200&fit=crop" 
                    alt="Location map" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm text-gray-600 mb-2">{barber.shopAddress}</p>
                <button className="text-sm text-teal-mint hover:underline">Edit</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-teal-mint flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-xl font-semibold text-gray-800">BarberPro</span>
              </div>
              <p className="text-sm text-gray-600">
                The world's premier marketplace for high-end grooming and barber services. Elevating your style, one cut at a time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">About Us</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Careers</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Partner with Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Help Center</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              © 2023 BarberPro Booking Marketplace. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default BarberProfile
