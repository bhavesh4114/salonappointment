import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Map frontend category id to backend category name (barberService ALLOWED_CATEGORIES)
const CATEGORY_MAP = {
  'hair-salon': 'Hair Salon',
  'men-salon': 'Men Salon',
  'women-salon': 'Women Salon',
  'unisex-salon': 'Unisex Salon',
  'spa': 'Spa',
  'beauty-parlour': 'Beauty Care Parlour',
}

const BarberRegistration = () => {
  const navigate = useNavigate()
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
    shopName: '',
    shopAddress: '',
    password: '',
    confirmPassword: ''
  })

  // Categories state
  const [selectedCategories, setSelectedCategories] = useState([])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')

  // Available categories
  const categories = [
    { id: 'hair-salon', label: 'Hair Salon', icon: '✂️' },
    { id: 'men-salon', label: 'Men Salon', icon: '👨' },
    { id: 'women-salon', label: 'Women Salon', icon: '👩' },
    { id: 'unisex-salon', label: 'Unisex Salon', icon: '👥' },
    { id: 'spa', label: 'Spa', icon: '🧖' },
    { id: 'beauty-parlour', label: 'Beauty Parlour', icon: '💄' }
  ]

  // Load Razorpay script
  useEffect(() => {
    if (window.Razorpay) return
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => { script.remove() }
  }, [])

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  // Toggle category selection
  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
    // Clear category error
    if (errors.categories) {
      setErrors(prev => ({
        ...prev,
        categories: ''
      }))
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}

    // Personal Details Validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required'
    } else if (!/^[0-9]{10}$/.test(formData.mobileNumber.replace(/\s+/g, ''))) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Shop Details Validation
    if (!formData.shopName.trim()) {
      newErrors.shopName = 'Shop / Salon name is required'
    }

    if (!formData.shopAddress.trim()) {
      newErrors.shopAddress = 'Shop address is required'
    } else if (formData.shopAddress.trim().length < 10) {
      newErrors.shopAddress = 'Please provide a complete address'
    }

    // Categories Validation
    if (selectedCategories.length === 0) {
      newErrors.categories = 'Please select at least one category'
    }

    // Password Validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission: register with subscription, then open Razorpay Checkout for mandate
  const handleSubmit = async (e) => {
    e.preventDefault()
    setCheckoutError('')
    if (!validateForm()) return

    setLoading(true)
    try {
      const categoryNames = selectedCategories
        .map((id) => CATEGORY_MAP[id])
        .filter(Boolean)
      if (categoryNames.length === 0) {
        setErrors((prev) => ({ ...prev, categories: 'Please select at least one category' }))
        setLoading(false)
        return
      }

      const res = await fetch(`${API_BASE}/api/barber/register-with-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          mobileNumber: formData.mobileNumber.trim(),
          email: formData.email?.trim() || undefined,
          password: formData.password,
          shopName: formData.shopName.trim(),
          shopAddress: formData.shopAddress.trim(),
          categories: categoryNames,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErrors((prev) => ({ ...prev, submit: data.message || 'Registration failed' }))
        setLoading(false)
        return
      }

      const { subscriptionId, key_id: keyId } = data
      if (!subscriptionId || !keyId) {
        setErrors((prev) => ({ ...prev, submit: 'Invalid response from server' }))
        setLoading(false)
        return
      }

      if (!window.Razorpay) {
        setErrors((prev) => ({ ...prev, submit: 'Payment gateway is loading. Please try again.' }))
        setLoading(false)
        return
      }

      const options = {
        key: keyId,
        subscription_id: subscriptionId,
        name: 'BarberPro',
        description: '90-day free trial, then ₹499/month. Approve mandate to complete registration.',
        handler: function () {
          setLoading(false)
          navigate('/login', { state: { message: 'Registration complete. Please log in.' } })
        },
        modal: {
          ondismiss: function () {
            setLoading(false)
            setCheckoutError('You must approve the mandate to complete registration. Please try again.')
          },
        },
      }
      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (err) {
      console.error('Barber registration error:', err)
      setErrors((prev) => ({ ...prev, submit: err.message || 'Registration failed' }))
      setLoading(false)
    }
  }

  // Check if form is valid for button state
  const isFormValid = () => {
    return (
      formData.fullName.trim() &&
      formData.mobileNumber.trim() &&
      formData.shopName.trim() &&
      formData.shopAddress.trim() &&
      selectedCategories.length > 0 &&
      formData.password &&
      formData.confirmPassword &&
      formData.password === formData.confirmPassword
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Barber Registration</h1>
          </div>
          <p className="text-gray-600 text-sm md:text-base">
            Join our premium grooming marketplace and grow your business
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-6 md:p-8 space-y-8">
            {/* Personal Details Section */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-amber-600 to-amber-800 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-900">Personal Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.fullName
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-amber-500 focus:border-amber-500'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                  )}
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.mobileNumber
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-amber-500 focus:border-amber-500'
                    }`}
                  />
                  {errors.mobileNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.mobileNumber}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.email
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-amber-500 focus:border-amber-500'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Shop Details Section */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-amber-600 to-amber-800 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-900">Shop Details</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {/* Shop Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Shop / Salon Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.shopName}
                    onChange={(e) => handleInputChange('shopName', e.target.value)}
                    placeholder="Enter your shop or salon name"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.shopName
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-amber-500 focus:border-amber-500'
                    }`}
                  />
                  {errors.shopName && (
                    <p className="mt-1 text-sm text-red-600">{errors.shopName}</p>
                  )}
                </div>

                {/* Shop Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Shop Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.shopAddress}
                    onChange={(e) => handleInputChange('shopAddress', e.target.value)}
                    placeholder="Enter full shop address&#10;Area, City, Pincode"
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
                      errors.shopAddress
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-amber-500 focus:border-amber-500'
                    }`}
                  />
                  {errors.shopAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.shopAddress}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Categories Section */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-amber-600 to-amber-800 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-900">Categories</h2>
                <span className="text-red-500 text-sm">*</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map((category) => {
                  const isSelected = selectedCategories.includes(category.id)
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                        isSelected
                          ? 'border-amber-600 bg-amber-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`text-3xl mb-2 ${isSelected ? 'scale-110' : ''} transition-transform`}>
                          {category.icon}
                        </div>
                        <p className={`text-sm font-semibold ${
                          isSelected ? 'text-amber-700' : 'text-gray-700'
                        }`}>
                          {category.label}
                        </p>
                        {isSelected && (
                          <div className="mt-2 flex items-center justify-center">
                            <div className="w-5 h-5 rounded-full bg-amber-600 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
              
              {errors.categories && (
                <p className="mt-2 text-sm text-red-600">{errors.categories}</p>
              )}
              
              {selectedCategories.length > 0 && (
                <p className="mt-3 text-sm text-gray-600">
                  Selected: <span className="font-semibold text-amber-700">{selectedCategories.length}</span> categor{selectedCategories.length === 1 ? 'y' : 'ies'}
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Password Section */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-amber-600 to-amber-800 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-900">Security</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Create a strong password"
                      className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        errors.password
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-amber-500 focus:border-amber-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Confirm your password"
                      className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        errors.confirmPassword
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-amber-500 focus:border-amber-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-6 md:px-8 py-6 border-t border-gray-200">
            {(errors.submit || checkoutError) && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {errors.submit || checkoutError}
              </div>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-500 text-center sm:text-left">
                By registering, you agree to our{' '}
                <a href="#" className="text-amber-600 hover:underline font-medium">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-amber-600 hover:underline font-medium">Privacy Policy</a>
              </p>
              
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid() || loading}
                  className={`px-8 py-3 rounded-lg font-semibold text-white transition-all w-full sm:w-auto ${
                    isFormValid() && !loading
                      ? 'bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 shadow-lg hover:shadow-xl transform hover:scale-105'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registering...
                    </span>
                  ) : (
                    'Register as Barber'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-amber-600 font-semibold hover:underline"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default BarberRegistration
