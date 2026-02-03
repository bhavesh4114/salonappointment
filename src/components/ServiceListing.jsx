import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import UserHeader from './UserHeader'

const ServiceListing = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

const selectedCategory = searchParams.get('category')   // ✅ ADD
const selectedPlan = searchParams.get('plan')           // already ok
const selectedAudience = searchParams.get('gender')     // already ok
const [cart, setCart] = useState({})
const [selectedServices, setSelectedServices] = useState([])

  
  // const [cart, setCart] = useState({})
  const [priceFilter, setPriceFilter] = useState('0-25')
  const [durationFilter, setDurationFilter] = useState('30-60')
  const [topRated, setTopRated] = useState(false)
const [services, setServices] = useState([])
const [loading, setLoading] = useState(true)

  // Service data matching the screenshot
useEffect(() => {
  const fetchServices = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/services?category=${encodeURIComponent(
          selectedCategory
        )}&gender=${selectedAudience}&plan=${selectedPlan}`
      )

      const data = await res.json()

      console.log("SERVICES FROM API:", data)

      // 🔥 MAIN FIX
      setServices(Array.isArray(data.services) ? data.services : [])

    } catch (err) {
      console.error(err)
    }
  }

  if (selectedCategory && selectedAudience && selectedPlan) {
    fetchServices()
  }
}, [selectedCategory, selectedAudience, selectedPlan])





const handleAddToCart = (service) => {
  setCart(prev => ({
    ...prev,
    [service.id]: (prev[service.id] || 0) + 1
  }))

setSelectedServices(prev => {
  if (prev.find(s => s.serviceId === service.id)) return prev

  return [
    ...prev,
    {
      serviceId: service.id,        // 🔥 FIX
      name: service.name,
      price: service.price,
      barberId: service.barberId,   // 🔥 MUST BE PRESENT
      duration: service.duration
    }
  ]
})


}


const handleQuantityChange = (serviceId, change) => {
  setCart(prev => {
    const newQuantity = (prev[serviceId] || 0) + change

    if (newQuantity <= 0) {
      const newCart = { ...prev }
      delete newCart[serviceId]

      setSelectedServices(prevServices =>
        prevServices.filter(s => s.serviceId !== serviceId)

      )

      return newCart
    }

    return {
      ...prev,
      [serviceId]: newQuantity
    }
  })
}


  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0)
  }

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const service = services.find(s => s.id === parseInt(id))
      return sum + (service ? service.price * qty : 0)
    }, 0)
  }


  // ================= FILTER LOGIC =================

// Price filter
// const filteredByPrice = services.filter((service) => {
//   const price = Number(service.price)

//   if (priceFilter === '0-25') return price <= 25
//   if (priceFilter === '25-50') return price > 25 && price <= 50
//   if (priceFilter === '50-500') return price > 50 && price <= 500
//   if (priceFilter === '500+') return price > 500

//   return true
// })
const filteredByPrice = services



// // Duration filter
const filteredByDuration = filteredByPrice.filter((service) => {
  const minutes =
  typeof service.duration === 'number'
    ? service.duration
    : parseInt(service.duration)
 // "30 min" → 30

  if (durationFilter === 'under-30') return minutes < 30
  if (durationFilter === '30-60') return minutes >= 30 && minutes <= 60
  return true
})

// // Rating filter
// const filteredServices = filteredByDuration.filter((service) => {
//   if (!topRated) return true
//  return Number(service.rating) >= 4.5

// })
const filteredServices = filteredByDuration

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated ? (
        <UserHeader />
      ) : (
        <nav className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-8 h-8 rounded-lg bg-teal-mint flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                  </svg>
                </div>
                <span className="text-xl font-semibold text-gray-800">BarberPro</span>
              </div>
              <div className="flex items-center gap-6">
                <button type="button" onClick={() => navigate('/')} className="text-gray-700 hover:text-gray-900 text-sm">Home</button>
                <button type="button" onClick={() => navigate('/services')} className="text-gray-700 hover:text-gray-900 text-sm">Services</button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for services..."
                  className="px-4 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-mint w-64"
                />
                <svg className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button type="button" onClick={() => navigate('/login')} className="px-3 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium">
                Login
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Breadcrumb and Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-sm text-gray-600 mb-2">
            <a href="#" className="hover:text-gray-900">Home</a>
            {' / '}
            <a href="#" className="hover:text-gray-900">Services</a>
            {' / '}
            <span className="text-gray-900 capitalize">
  {selectedCategory} for {selectedAudience}
</span>

          </div>
         <h1 className="text-3xl font-bold text-gray-900 mb-1 capitalize">
  {selectedPlan} {selectedCategory} services
</h1>
{selectedPlan === 'ROYALE' && (

  <span className="ml-2 px-2 py-0.5 text-xs bg-purple-600 text-white rounded">
    Royale
  </span>
)}

          <p className="text-gray-600 text-sm">
            Professional barbers at your doorstep
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Filters */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button className="text-sm text-teal-mint hover:underline">RESET</button>
              </div>

              {/* Price Range */}
              {/* <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-gray-900">Price Range</h3>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      value="0-25"
                      checked={priceFilter === '0-25'}
                      onChange={(e) => setPriceFilter(e.target.value)}
                      className="w-4 h-4 text-teal-mint focus:ring-teal-mint"
                    />
                    <span className="text-sm text-gray-700">$0 - $25</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      value="25-50"
                      checked={priceFilter === '25-50'}
                      onChange={(e) => setPriceFilter(e.target.value)}
                      className="w-4 h-4 text-teal-mint focus:ring-teal-mint"
                    />
                    <span className="text-sm text-gray-700">$25 - $50</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      value="50+"
                      checked={priceFilter === '50+'}
                      onChange={(e) => setPriceFilter(e.target.value)}
                      className="w-4 h-4 text-teal-mint focus:ring-teal-mint"
                    />
                    <span className="text-sm text-gray-700">$50+</span>
                  </label>
                </div>
              </div> */}

              {/* Duration */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-gray-900">Duration</h3>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="duration"
                      value="under-30"
                      checked={durationFilter === 'under-30'}
                      onChange={(e) => setDurationFilter(e.target.value)}
                      className="w-4 h-4 text-teal-mint focus:ring-teal-mint"
                    />
                    <span className="text-sm text-gray-700">Under 30 mins</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="duration"
                      value="30-60"
                      checked={durationFilter === '30-60'}
                      onChange={(e) => setDurationFilter(e.target.value)}
                      className="w-4 h-4 text-teal-mint focus:ring-teal-mint"
                    />
                    <span className="text-sm text-gray-700">30 - 60 mins</span>
                  </label>
                </div>
              </div>

              {/* Top Rated */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-gray-900">Top Rated</h3>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={topRated}
                    onChange={(e) => setTopRated(e.target.checked)}
                    className="w-4 h-4 text-teal-mint focus:ring-teal-mint"
                  />
                  <span className="text-sm text-gray-700">4.5+ Rating</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Content - Service Cards */}
          <div className="flex-1 space-y-4">
            {filteredServices.length === 0 && (
  <div className="text-center text-gray-500 py-20">
    No services available for selected filters
  </div>
)}

           {filteredServices.map((service) => {

              const imageSrc =
                service.image && service.image.startsWith('http')
                  ? service.image
                  : service.image
                  ? `http://localhost:5000${service.image}`
                  : 'https://via.placeholder.com/128x128?text=Service'

              return (
                <div key={service.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex gap-6">
                    {/* Service Image */}
                    <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                      <img
                        src={imageSrc}
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                  {/* Service Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {service.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{service.duration} mins</span>

                          <span className="flex items-center gap-1 text-gray-500">
  <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
    <path d="M9.049 2.927c..." />
  </svg>
  {service.rating ?? 0} ({service.reviewCount ?? 0})
</span>

                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-teal-mint mb-4">
                          ${service.price}
                        </div>
                        {cart[service.id] ? (
                          <div className="flex items-center gap-2 border border-teal-mint rounded-lg">
                            <button
                              onClick={() => handleQuantityChange(service.id, -1)}
                              className="px-3 py-1 text-teal-mint hover:bg-teal-50"
                            >
                              -
                            </button>
                            <span className="px-3 py-1 text-teal-mint font-medium">{cart[service.id]}</span>
                            <button
                              onClick={() => handleQuantityChange(service.id, 1)}
                              className="px-3 py-1 text-teal-mint hover:bg-teal-50"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                             onClick={() => handleAddToCart(service)}
                            className="px-6 py-2 bg-teal-mint text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                   <p className="text-sm text-gray-600 leading-relaxed">
  {service.description || 'Professional service by expert barber'}
</p>

                  </div>
                </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom Sticky Cart Bar */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <svg className="w-6 h-6 text-teal-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {getTotalItems()} item{getTotalItems() > 1 ? 's' : ''} | ${getTotalPrice()}
                </div>
                <div className="text-xs text-gray-500">
                  EXTRA TAXES MAY APPLY
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">
                View Cart
              </button>
             <button
  onClick={() =>
    navigate('/barbers', {
      state: {
        // 🔥 SINGLE SOURCE OF TRUTH
        selectedServiceObjects: selectedServices,

        category: selectedCategory,
        plan: selectedPlan,
        gender: selectedAudience
      }
    })
  }
  className="px-6 py-2 bg-teal-mint text-white rounded-lg"
>

  Proceed to Book →
</button>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceListing
