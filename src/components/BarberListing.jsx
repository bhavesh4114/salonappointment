import { useNavigate, useLocation } from 'react-router-dom'
import React, { useState, useEffect } from 'react'


const BarberListing = () => {
  const navigate = useNavigate()
  const location = useLocation()
const [barbers, setBarbers] = useState([])

const selectedServiceObjects =
  location.state?.selectedServiceObjects || []

const selectedServiceIds = selectedServiceObjects.map(s => s.serviceId)



const [loading, setLoading] = useState(true)



  const [sortBy, setSortBy] = useState('Recommended')
  const [rating, setRating] = useState('4.5+')
  const [availability, setAvailability] = useState('Today')
  const [experience, setExperience] = useState('')
  const [priceRange, setPriceRange] = useState([20, 150])

useEffect(() => {
  if (selectedServiceIds.length === 0) {
    setBarbers([])
    setLoading(false)
    return
  }

  setLoading(true)
 const servicesQuery = selectedServiceIds.join(',')

fetch(
  `http://localhost:5000/api/barbers/filter?serviceIds=${servicesQuery}`
)


    .then(res => res.json())
 .then(data => {
  setBarbers(data.barbers || [])
})


    .catch(err => console.error(err))
    .finally(() => setLoading(false))
}, [selectedServiceIds.join(',')])





const getBarberServicePrice = (barber) => {
  const service = barber.services?.[0]
  return service?.price || null
}





  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb and Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-sm text-gray-600 mb-3">
            <a href="#" className="hover:text-gray-900">Home</a>
            {' > '}
            <a href="#" className="hover:text-gray-900">Services</a>
            {' > '}
            <a href="#" className="hover:text-gray-900">Men's Haircut</a>
            {' > '}
            <span className="text-gray-900">Barbers</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Available Barbers Near You
          </h1>
          <p className="text-gray-600 text-sm">
            Premium, top-rated professionals for your selected service
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
                <button className="text-sm text-teal-mint hover:underline">Reset</button>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  SORT BY
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-mint"
                >
                  <option>Recommended</option>
                  <option>Rating</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  RATING
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      value="4.5+"
                      checked={rating === '4.5+'}
                      onChange={(e) => setRating(e.target.value)}
                      className="w-4 h-4 text-teal-mint focus:ring-teal-mint"
                    />
                    <span className="text-sm text-gray-700">4.5+ Stars</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      value="4.0+"
                      checked={rating === '4.0+'}
                      onChange={(e) => setRating(e.target.value)}
                      className="w-4 h-4 text-teal-mint focus:ring-teal-mint"
                    />
                    <span className="text-sm text-gray-700">4.0+ Stars</span>
                  </label>
                </div>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  AVAILABILITY
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAvailability('Today')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      availability === 'Today'
                        ? 'bg-teal-mint text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Available Today
                  </button>
                  <button
                    onClick={() => setAvailability('Tomorrow')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      availability === 'Tomorrow'
                        ? 'bg-teal-mint text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Tomorrow
                  </button>
                </div>
              </div>

              {/* Experience */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  EXPERIENCE
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="experience"
                      value="10+"
                      checked={experience === '10+'}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-4 h-4 text-teal-mint focus:ring-teal-mint"
                    />
                    <span className="text-sm text-gray-700">10+ Years</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="experience"
                      value="5+"
                      checked={experience === '5+'}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-4 h-4 text-teal-mint focus:ring-teal-mint"
                    />
                    <span className="text-sm text-gray-700">5+ Years</span>
                  </label>
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  PRICE RANGE
                </label>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">${priceRange[0]}</span>
                  <span className="text-sm text-gray-700">${priceRange[1]}+</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="150"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-mint"
                />
              </div>
            </div>
          </div>

          {/* Right Content - Barber List */}
          <div className="flex-1 space-y-4">
            {loading && (
  <p className="text-center text-gray-500">
    Loading barbers...
  </p>
)}

{!loading && barbers.length === 0 && (
  <p className="text-center text-gray-500">
    No barbers found for selected service
  </p>
)}

           {Array.isArray(barbers) && barbers.map((barber) => (



              <div key={barber.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex gap-6">
                  {/* Profile Image */}
                 <div className="flex-shrink-0">
  <img
   src="https://via.placeholder.com/100"

    alt={barber.fullName || "Barber"}
    className="w-24 h-24 rounded-full object-cover"
  />
</div>


                  {/* Barber Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-semibold text-gray-900">
                             {barber.fullName}

                          </h3>
                          {barber.badge && (
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              barber.badge === 'ELITE' 
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {barber.badge}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          New Barber



                          </span>
                          <span>{barber.experience ?? 0}+ Years Exp</span>

                        </div>
                      <div className="flex flex-wrap gap-2 mb-2">
  {Array.isArray(barber.categories) &&
    barber.categories.map((item, idx) => (
      <span
        key={idx}
        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
      >
        {item.category?.name}
      </span>
    ))}
</div>

                        <p className="text-sm text-gray-600 leading-relaxed">
  {barber.description || 'Professional and verified barber'}
</p>

                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-teal-mint mb-4">
                          <div className="text-2xl font-bold text-teal-mint mb-4">
{getBarberServicePrice(barber)
  ? `₹${getBarberServicePrice(barber)}`
  : '₹ —'}

</div>

                        </div>
                        <button
                          onClick={() => navigate(`/barber/${barber.id}`)}
                          className="px-6 py-2 bg-teal-mint text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 text-sm font-medium"
                        >
                          View Profile
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Load More Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Showing {barbers.length} barbers


          </p>
          <button className="px-6 py-2 border-2 border-teal-mint text-teal-mint rounded-lg hover:bg-teal-50 transition-colors font-medium">
            Load More Results
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-4 gap-8 mb-8">
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
                Premium barber & grooming services at your fingertips.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">About Us</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Careers</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Help Center</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Safety</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Social</h4>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              © 2024 BarberPro Marketplace. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default BarberListing
