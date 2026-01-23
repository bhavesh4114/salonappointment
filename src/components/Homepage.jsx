import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'

const Homepage = () => {
  const navigate = useNavigate()

const [modalOpen, setModalOpen] = useState(false)
const [preferenceOpen, setPreferenceOpen] = useState(false)

const [selectedCategory, setSelectedCategory] = useState(null) // 👈 ADD THIS
const [selectedGender, setSelectedGender] = useState(null)     // 👈 ADD THIS




const handleCloseModal = () => {
  setModalOpen(false)
  setPreferenceOpen(false)
}

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="px-8 py-12">
        <div className="flex gap-12 items-start max-w-7xl mx-auto">
          {/* Left Content */}
          <div className="flex-1">
            <h1 className="text-5xl font-bold text-gray-800 mb-4 leading-tight">
              Home barber services at your doorstep.
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Professional grooming and styling by top-rated barbers, delivered to the comfort of your home.
            </p>
            
            {/* Service Grid Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="grid grid-cols-3 gap-6">
                {/* Row 1 */}
                <div className="flex flex-col items-center gap-2 cursor-pointer"onClick={() => {
  setSelectedCategory('HAIRCUT')
  setSelectedGender(null)   // 👈 ADD THIS
  setModalOpen(true)
}}


>
                  <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-teal-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700 text-center">Haircut</span>
                </div>
                <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => {
  setSelectedCategory('BEARD')
  setModalOpen(true)
}}
>
                  <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-teal-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700 text-center">Beard Trim</span>
                </div>
                <div className="flex flex-col items-center gap-2 cursor-pointer"onClick={() => {
  setSelectedCategory('SPA')
  setModalOpen(true)
}}
>
                  <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-teal-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700 text-center">Hair Spa</span>
                </div>
                
                {/* Row 2 */}
                <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => {
  setSelectedCategory('FACIAL')
  setModalOpen(true)
}}
>
                  <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-teal-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700 text-center">Facial</span>
                </div>
                <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => {
  setSelectedCategory('GROOMING')
  setModalOpen(true)
}}
>
                  <div className="w-12 h-12 rounded-lg bg-teal-mint flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700 text-center">Grooming Pkg</span>
                </div>
                <div className="flex flex-col items-center gap-2 cursor-pointer"onClick={() => {
  setSelectedCategory('KIDS')
  setModalOpen(true)
}}
>
                  <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-teal-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700 text-center">Kids Haircut</span>
                </div>
                
                {/* Row 3 */}
                <div className="flex flex-col items-center gap-2 cursor-pointer"onClick={() => {
  setSelectedCategory('ELITE')
  setModalOpen(true)
}}
>
                  <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-teal-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700 text-center">Elite Barber</span>
                </div>
                <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => handleServiceClick('salon')}>
                  <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-teal-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700 text-center">Home Pro</span>
                </div>
                <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => navigate('/offers')}>
                  <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-teal-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <span className="text-sm text-red-500 text-center">Offers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl overflow-hidden h-48">
                <img 
                  src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=300&fit=crop" 
                  alt="Barber" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-xl overflow-hidden h-48">
                <img 
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=300&fit=crop" 
                  alt="Bearded man" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-xl overflow-hidden h-48">
                <img 
                  src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=300&fit=crop" 
                  alt="Facial treatment" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-xl overflow-hidden h-48">
                <img 
                  src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop" 
                  alt="Barber chair" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Metrics Strip */}
      <section className="px-8 py-8 bg-gray-50">
        <div className="flex justify-center gap-16 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-mint flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800">4.8</div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">Service Rating</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-mint flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800">12M+</div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">Happy Customers</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-mint flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800">Verified</div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">Professionals</div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services Section */}
      <section className="px-8 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-3">Our Popular Services</h2>
            <p className="text-lg text-gray-600">Curated grooming packages for every style.</p>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            {/* Card 1: The Classic Refresh */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="relative h-64">
                <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-2 py-1 rounded uppercase font-semibold z-10">Popular</span>
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&auto=format" 
                  alt="The Classic Refresh" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop&auto=format';
                  }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">The Classic Refresh</h3>
                <p className="text-gray-600 mb-4">Haircut + Scalp Massage + Styling</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-teal-mint">$45</span>
                  <button className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                    BOOK NOW
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: Beard Sculpting */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="relative h-64">
                <img 
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop" 
                  alt="Beard Sculpting" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Beard Sculpting</h3>
                <p className="text-gray-600 mb-4">Trimming + Hot Towel + Oil Massage</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-teal-mint">$30</span>
                  <button className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                    BOOK NOW
                  </button>
                </div>
              </div>
            </div>

            {/* Card 3: The Royal Treatment */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="relative h-64">
                <span className="absolute top-3 left-3 bg-purple-600 text-white text-xs px-2 py-1 rounded uppercase font-semibold z-10">Premium</span>
                <img 
                  src="https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=400&h=400&fit=crop" 
                  alt="The Royal Treatment" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">The Royal Treatment</h3>
                <p className="text-gray-600 mb-4">Haircut + Beard + Facial + Messege</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-teal-mint">$85</span>
                  <button className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                    BOOK NOW
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-12 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-teal-mint flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-xl font-semibold text-gray-800">BarberPro</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Bringing the premium barbershop experience directly to your living room. Professional, convenient, and safe.
              </p>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-800 text-sm">About Us</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-800 text-sm">Careers</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-800 text-sm">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-800 text-sm">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-800 text-sm">Help Center</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-800 text-sm">Contact Us</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-800 text-sm">Safety Measures</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-800 text-sm">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-gray-200">
            <p className="text-gray-600 text-sm">© 2024 BarberPro Marketplace Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Service Selection Modal */}
      {modalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Select Service For
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Options Grid */}
         <div className="grid grid-cols-2 gap-4">

  {/* MEN → ALL categories */}
  <button
    onClick={() => {
      setSelectedGender('MEN')
      setModalOpen(false)
      setPreferenceOpen(true)
    }}
    className="p-6 border rounded-lg"
  >
    👨 Men
  </button>

  {/* WOMEN → NOT FOR BEARD */}
  {selectedCategory !== 'BEARD' && (
    <button
      onClick={() => {
        setSelectedGender('WOMEN')
        setModalOpen(false)
        setPreferenceOpen(true)
      }}
      className="p-6 border rounded-lg"
    >
      👩 Women
    </button>
  )}

</div>




          </div>
        </div>
      )}


{preferenceOpen && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white w-full max-w-lg rounded-xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <button
          onClick={() => {
            setPreferenceOpen(false)
            setModalOpen(true)
          }}
          className="text-xl"
        >
          ←
        </button>

        <h3 className="font-semibold text-gray-800">
  {selectedCategory} for {selectedGender}
</h3>


        <button className="text-xl">⤴</button>
      </div>

      {/* Title */}
      <div className="px-5 py-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Select your preference
        </h2>
      </div>

      {/* Options */}
      <div className="px-4 pb-6 space-y-4">

        {/* Royale */}
        <button
          onClick={() => {
            setPreferenceOpen(false)
            navigate(
  `/services?category=${selectedCategory}&gender=${selectedGender}&plan=ROYALE`
)


          }}
          className="w-full flex items-center gap-4 p-4 border rounded-xl hover:shadow-md transition"
        >
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="Royale"
            className="w-16 h-16 rounded-lg object-cover"
          />

          <div className="flex-1 text-left">
            <h4 className="font-semibold text-lg">Royale</h4>
            <div className="text-sm text-gray-500">₹₹₹ · LUXURY</div>
          </div>

          <span className="text-xl text-gray-400">›</span>
        </button>

        {/* Prime */}
       <button
  onClick={() => {
    setPreferenceOpen(false)
    navigate(
      `/services?category=${selectedCategory}&gender=${selectedGender}&plan=PRIME`
    )
  }}
  className="w-full flex items-center gap-4 p-4 border rounded-xl hover:shadow-md transition"
>

          <img
            src="https://randomuser.me/api/portraits/men/45.jpg"
            alt="Prime"
            className="w-16 h-16 rounded-lg object-cover"
          />

          <div className="flex-1 text-left">
            <h4 className="font-semibold text-lg">Prime</h4>
            <div className="text-sm text-gray-500">₹₹ · ECONOMICAL</div>
          </div>

          <span className="text-xl text-gray-400">›</span>
        </button>

      </div>
    </div>
  </div>
)}
    </div>
  )
}

export default Homepage
