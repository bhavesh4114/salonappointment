import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const Signup = () => {
  const navigate = useNavigate()
  const [userType, setUserType] = useState('User')
  const [formData, setFormData] = useState({
    fullName: '',
    countryCode: '+1',
    mobileNumber: '',
    email: '',
    shopName: '',
    shopAddress: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [registrationFee, setRegistrationFee] = useState(null)
  const razorpayScriptLoaded = useRef(false)

  // Fetch registration fee when Barber is selected
  useEffect(() => {
    if (userType === 'Barber' && !registrationFee) {
      fetch('http://localhost:5000/api/barber/registration-fee')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.amount) {
            setRegistrationFee(data.amount)
          } else {
            // Fallback to default if amount is missing
            setRegistrationFee(499)
          }
        })
        .catch(err => {
          console.error('Failed to fetch registration fee:', err)
          // Fallback to default on error
          setRegistrationFee(499)
        })
    }
  }, [userType, registrationFee])

  // Available categories (must match backend ALLOWED_CATEGORIES)
  const categories = [
    { id: 'hair-salon', label: 'Hair Salon', icon: '✂️' },
    { id: 'men-salon', label: 'Men Salon', icon: '👨' },
    { id: 'women-salon', label: 'Women Salon', icon: '👩' },
    { id: 'unisex-salon', label: 'Unisex Salon', icon: '👥' },
    { id: 'spa', label: 'Spa', icon: '🧖' },
    { id: 'beauty-parlour', label: 'Beauty Care Parlour', icon: '💄' }
  ]

  // Toggle category selection
  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user types
    if (error) setError('')
  }

  // Load Razorpay checkout script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (razorpayScriptLoaded.current) {
        resolve()
        return
      }

      if (window.Razorpay) {
        razorpayScriptLoaded.current = true
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = () => {
        razorpayScriptLoaded.current = true
        resolve()
      }
      script.onerror = () => {
        reject(new Error('Failed to load Razorpay checkout script'))
      }
      document.body.appendChild(script)
    })
  }

  // Create payment order
  const createPaymentOrder = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/barber/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create payment order')
      }
      // Return the full response object (backend returns flat structure)
      return data
    } catch (err) {
      console.error('Create payment order error:', err)
      throw new Error('Failed to create payment order. Please try again.')
    }
  }

  // Process payment using Razorpay checkout
  const processPayment = async (orderData) => {
    // Load Razorpay script if not already loaded
    await loadRazorpayScript()

    // Validate required data
    const razorpayKey = orderData?.key
    const orderId = orderData?.orderId
    const amount = orderData?.amount || 499 // Amount in rupees

    if (!razorpayKey) {
      throw new Error('Razorpay key is missing from payment order')
    }

    if (!orderId) {
      throw new Error('Order ID is missing from payment order')
    }

    // Convert amount to paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = amount * 100

    // Return promise that resolves when payment completes
    return new Promise((resolve, reject) => {
      try {
        // Create Razorpay checkout options
        const options = {
          key: razorpayKey,
          amount: amountInPaise,
          currency: 'INR',
          order_id: orderId,
          name: 'Barber Registration',
          description: 'Barber Shop Registration Fee',
          handler: function (response) {
            // Payment successful - resolve with payment details
            resolve({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              status: 'SUCCESS'
            })
          },
          prefill: {
            name: formData.fullName || '',
            email: formData.email || '',
            contact: formData.mobileNumber || ''
          },
          theme: {
            color: '#14b8a6' // teal-mint color
          },
          modal: {
            ondismiss: function () {
              // Payment cancelled by user
              reject(new Error('Payment cancelled by user'))
            }
          }
        }

        // Open Razorpay checkout popup
        const razorpay = new window.Razorpay(options)
        razorpay.open()
      } catch (error) {
        console.error('Razorpay error:', error)
        reject(new Error('Failed to open payment gateway. Please try again.'))
      }
    })
  }

  // Register barber with payment
  const registerBarberWithPayment = async (paymentData) => {
    try {
      // Map category IDs to category names
      const categoryNames = selectedCategories.map(catId => {
        const category = categories.find(c => c.id === catId)
        return category ? category.label : catId
      })

      const payload = {
        fullName: formData.fullName.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        email: formData.email.trim() || undefined,
        password: formData.password,
        shopName: formData.shopName.trim(),
        shopAddress: formData.shopAddress.trim(),
        categories: categoryNames,
        paymentId: paymentData.paymentId,
        orderId: paymentData.orderId
      }

      const response = await fetch('http://localhost:5000/api/barber/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      return data
    } catch (err) {
      console.error('Barber registration error:', err)
      throw err
    }
  }

  // Register user (normal flow without payment)
  const registerUser = async () => {
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        email: formData.email.trim() || undefined,
        password: formData.password,
        countryCode: formData.countryCode,
        role: 'user'
      }

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          throw new Error(data.errors[0].msg || 'Validation error')
        } else {
          throw new Error(data.message || 'Signup failed')
        }
      }

      return data
    } catch (err) {
      console.error('User registration error:', err)
      throw err
    }
  }

  const handleSignup = async () => {
    // Validation
    if (!formData.fullName.trim()) {
      setError('Full name is required')
      return
    }
    if (!formData.mobileNumber.trim()) {
      setError('Mobile number is required')
      return
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    // Barber-specific validation
    if (userType === 'Barber') {
      if (!formData.shopName.trim()) {
        setError('Shop / Salon name is required')
        return
      }
      if (!formData.shopAddress.trim()) {
        setError('Shop address is required')
        return
      }
      if (selectedCategories.length === 0) {
        setError('Please select at least one category')
        return
      }
    }

    setLoading(true)
    setError('')

    try {
      if (userType === 'Barber') {
        // BARBER FLOW: Payment → Registration
        // Step 1: Create payment order
        setLoading(true)
        setError('')
        const orderData = await createPaymentOrder()

        // Step 2: Process payment
        setError('Processing payment...')
        const paymentData = await processPayment(orderData)

        // Step 3: Register barber with payment details
        setError('Completing registration...')
        await registerBarberWithPayment(paymentData)

        // Success
        setSuccess(true)
        setLoading(false)
        setError('')
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        // USER FLOW: Normal registration (no payment)
        await registerUser()

        // Success
        setSuccess(true)
        setLoading(false)
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError(err.message || 'Registration failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-8">
      {/* Top Logo */}
      <div className="mb-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-mint flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
            </svg>
          </div>
          <span className="text-xl font-semibold text-gray-800">BarberPro</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-lg shadow-md w-full max-w-md p-8 mb-8">
        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Create your account
        </h1>
        
        {/* Subtext */}
        <p className="text-gray-600 mb-8 text-sm">
          Join the premium grooming marketplace.
        </p>

        {/* Create account as Label */}
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Create account as
        </p>

        {/* Role Selector Toggle */}
        <div className="bg-gray-100 rounded-full p-1 flex mb-8">
          <button
            onClick={() => {
              setUserType('User')
              // Clear shop fields and categories when switching to User
              setFormData(prev => ({
                ...prev,
                shopName: '',
                shopAddress: ''
              }))
              setSelectedCategories([])
            }}
            className={`flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-colors ${
              userType === 'User'
                ? 'bg-teal-mint text-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            User
          </button>
          <button
            onClick={() => setUserType('Barber')}
            className={`flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-colors ${
              userType === 'Barber'
                ? 'bg-teal-mint text-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Barber
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-5 mb-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border border-teal-mint rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile number
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.countryCode}
                onChange={(e) => handleInputChange('countryCode', e.target.value)}
                className="w-20 px-3 py-3 border border-teal-mint rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent bg-gray-700 text-white text-sm"
              />
              <input
                type="text"
                value={formData.mobileNumber}
                onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                placeholder="123 456 7890"
                className="flex-1 px-4 py-3 border border-teal-mint rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Email (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email (optional)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-3 border border-teal-mint rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
            />
          </div>

          {/* Shop Name - Only for Barber */}
          {userType === 'Barber' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shop / Salon Name
              </label>
              <input
                type="text"
                value={formData.shopName}
                onChange={(e) => handleInputChange('shopName', e.target.value)}
                placeholder="Enter your shop or salon name"
                className="w-full px-4 py-3 border border-teal-mint rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
              />
            </div>
          )}

          {/* Shop Address - Only for Barber */}
          {userType === 'Barber' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shop Address
              </label>
              <textarea
                value={formData.shopAddress}
                onChange={(e) => handleInputChange('shopAddress', e.target.value)}
                placeholder="Enter full shop address&#10;Area, City, Pincode"
                rows={3}
                className="w-full px-4 py-3 border border-teal-mint rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent bg-gray-700 text-white placeholder-gray-400 resize-none"
              />
            </div>
          )}

          {/* Categories - Only for Barber */}
          {userType === 'Barber' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Categories <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((category) => {
                  const isSelected = selectedCategories.includes(category.id)
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 ${
                        isSelected
                          ? 'border-teal-mint bg-teal-mint/10 shadow-md'
                          : 'border-gray-300 bg-gray-700 hover:border-teal-mint/50'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`text-2xl mb-1 ${isSelected ? 'scale-110' : ''} transition-transform`}>
                          {category.icon}
                        </div>
                        <p className={`text-xs font-medium ${
                          isSelected ? 'text-teal-mint' : 'text-gray-300'
                        }`}>
                          {category.label}
                        </p>
                        {isSelected && (
                          <div className="mt-1 flex items-center justify-center">
                            <div className="w-4 h-4 rounded-full bg-teal-mint flex items-center justify-center">
                              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              {selectedCategories.length > 0 && (
                <p className="mt-2 text-xs text-gray-400">
                  Selected: <span className="font-semibold text-teal-mint">{selectedCategories.length}</span> categor{selectedCategories.length === 1 ? 'y' : 'ies'}
                </p>
              )}
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Create a strong password"
                className="w-full px-4 py-3 pr-12 border border-teal-mint rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-green-600 font-medium">Successfully registered! Redirecting to login...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && !success && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Payment Info for Barber */}
        {userType === 'Barber' && registrationFee && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-blue-700">
                <span className="font-semibold">Registration Fee: ₹{registrationFee}</span>
                <span className="ml-2">(Payment required to complete registration)</span>
              </p>
            </div>
          </div>
        )}

        {/* Sign up & continue Button */}
        <button
          onClick={handleSignup}
          disabled={loading || success}
          className={`w-full bg-teal-mint text-white py-3 rounded-lg font-medium transition-opacity mb-4 ${
            loading || success ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
          }`}
        >
          {loading 
            ? (userType === 'Barber' ? 'Processing payment...' : 'Creating account...') 
            : success 
            ? 'Registered Successfully!' 
            : userType === 'Barber' 
            ? `Sign up & Pay ₹${registrationFee || '499'}` 
            : 'Sign up & continue'}
        </button>

        {/* Login Link */}
        <div className="text-center">
          <span className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-teal-mint font-medium hover:underline"
            >
              Login
            </button>
          </span>
        </div>
      </div>

      {/* Footer Links */}
      <div className="text-center space-x-4 mb-2">
        <button className="text-xs text-gray-500 hover:text-teal-mint hover:underline">
          Terms of Service
        </button>
        <button className="text-xs text-gray-500 hover:text-teal-mint hover:underline">
          Privacy Policy
        </button>
        <button className="text-xs text-gray-500 hover:text-teal-mint hover:underline">
          Help Center
        </button>
      </div>

      {/* Copyright */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          © 2024 BarberPro Inc. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default Signup
