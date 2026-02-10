import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Map frontend category id to backend category name (same as BarberRegistration)
const CATEGORY_MAP = {
  'hair-salon': 'Hair Salon',
  'men-salon': 'Men Salon',
  'women-salon': 'Women Salon',
  'unisex-salon': 'Unisex Salon',
  'spa': 'Spa',
  'beauty-parlour': 'Beauty Care Parlour',
}

const Signup = () => {
  const navigate = useNavigate()
  const [userType, setUserType] = useState('User')
  const [formData, setFormData] = useState({
    fullName: '',
    countryCode: '+91',
    mobileNumber: '',
    email: '',
    shopName: '',
    shopAddress: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [registrationFee, setRegistrationFee] = useState(null)
  const [barberErrors, setBarberErrors] = useState({})
  const [checkoutError, setCheckoutError] = useState('')
  const razorpayScriptLoaded = useRef(false)

  // Preload Razorpay when Barber is selected so mandate checkout is ready
  useEffect(() => {
    if (userType === 'Barber') loadRazorpayScript().catch(() => {})
  }, [userType])

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
    if (userType === 'Barber' && barberErrors.categories) {
      setBarberErrors(prev => ({ ...prev, categories: '' }))
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    if (error) setError('')
    if (userType === 'Barber' && barberErrors[field]) {
      setBarberErrors(prev => ({ ...prev, [field]: '' }))
    }
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

  // Barber form validation (same rules as BarberRegistration)
  const validateBarberForm = () => {
    const newErrors = {}
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required'
    } else if (!/^[0-9]{10}$/.test(formData.mobileNumber.replace(/\s+/g, ''))) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number'
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.shopName.trim()) newErrors.shopName = 'Shop / Salon name is required'
    if (!formData.shopAddress.trim()) {
      newErrors.shopAddress = 'Shop address is required'
    } else if (formData.shopAddress.trim().length < 10) {
      newErrors.shopAddress = 'Please provide a complete address'
    }
    if (selectedCategories.length === 0) newErrors.categories = 'Please select at least one category'
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
    setBarberErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isBarberFormValid = () => {
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

  const handleBarberSubmit = async (e) => {
    e.preventDefault()
    setCheckoutError('')
    setBarberErrors((prev) => ({ ...prev, submit: '' }))
    if (!validateBarberForm()) return

    const categoryNames = selectedCategories.map((id) => CATEGORY_MAP[id]).filter(Boolean)
    if (categoryNames.length === 0) {
      setBarberErrors((prev) => ({ ...prev, categories: 'Please select at least one category' }))
      return
    }

    setLoading(true)
    try {
      const orderRes = await fetch(`${API_BASE}/api/barber/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const orderData = await orderRes.json().catch(() => ({}))
      if (!orderRes.ok || !orderData.success) {
        setBarberErrors((prev) => ({ ...prev, submit: orderData.message || 'Failed to create payment order' }))
        setLoading(false)
        return
      }
      const { orderId, amount, key: keyId } = orderData
      if (!orderId || !keyId) {
        setBarberErrors((prev) => ({ ...prev, submit: 'Invalid response from server' }))
        setLoading(false)
        return
      }

      await loadRazorpayScript()
      if (!window.Razorpay) {
        setBarberErrors((prev) => ({ ...prev, submit: 'Payment gateway is loading. Please try again.' }))
        setLoading(false)
        return
      }

      const barberPayload = {
        fullName: formData.fullName.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        email: formData.email?.trim() || undefined,
        password: formData.password,
        shopName: formData.shopName.trim(),
        shopAddress: formData.shopAddress.trim(),
        categories: categoryNames,
      }

      const options = {
        key: keyId,
        amount: amount || 49900,
        currency: 'INR',
        order_id: orderId,
        name: 'BarberPro',
        description: 'Barber registration fee ₹499',
        prefill: {
          name: formData.fullName || '',
          email: formData.email || '',
          contact: formData.mobileNumber || '',
        },
        handler: async function (response) {
          try {
            const registerRes = await fetch(`${API_BASE}/api/barber/register-with-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                ...barberPayload,
              }),
            })
            const registerData = await registerRes.json().catch(() => ({}))
            setLoading(false)
            if (registerRes.ok && registerData.success) {
              navigate('/login', { state: { message: 'Registration complete. Please log in.' } })
              return
            }
            setBarberErrors((prev) => ({ ...prev, submit: registerData.message || 'Registration failed after payment. Please contact support.' }))
          } catch (err) {
            setLoading(false)
            setBarberErrors((prev) => ({ ...prev, submit: err.message || 'Registration failed. Please contact support.' }))
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false)
            setCheckoutError('Payment is required to complete registration. Please try again.')
          },
        },
      }
      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (err) {
      console.error('Barber registration error:', err)
      setBarberErrors((prev) => ({ ...prev, submit: err.message || 'Registration failed' }))
      setLoading(false)
    }
  }

  const handleSignup = async () => {

    // Validation (User only)
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

    setLoading(true)
    setError('')

    try {
      await registerUser()
      setSuccess(true)
      setLoading(false)
      setTimeout(() => navigate('/login'), 2000)
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

      {/* Main Card - same width for User and Barber */}
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
              setFormData(prev => ({
                ...prev,
                shopName: '',
                shopAddress: '',
                confirmPassword: ''
              }))
              setSelectedCategories([])
              setBarberErrors({})
              setCheckoutError('')
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

        {/* Barber: same design as User, single-column, extra fields appended inline */}
        {userType === 'Barber' && (
          <form onSubmit={handleBarberSubmit}>
            <div className="space-y-5 mb-6">
              {/* Full name - same as User */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent bg-gray-700 text-white placeholder-gray-400 ${barberErrors.fullName ? 'border-red-300' : 'border-teal-mint'}`}
                />
                {barberErrors.fullName && <p className="mt-1 text-sm text-red-600">{barberErrors.fullName}</p>}
              </div>

              {/* Mobile number - same as User */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile number</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.countryCode}
                    onChange={(e) => handleInputChange('countryCode', e.target.value)}
                    className="w-20 px-3 py-3 border border-teal-mint rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent bg-gray-700 text-white text-sm"
                  />
                  <input
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                    placeholder="123 456 7890"
                    maxLength="10"
                    className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent bg-gray-700 text-white placeholder-gray-400 ${barberErrors.mobileNumber ? 'border-red-300' : 'border-teal-mint'}`}
                  />
                </div>
                {barberErrors.mobileNumber && <p className="mt-1 text-sm text-red-600">{barberErrors.mobileNumber}</p>}
              </div>

              {/* Email (optional) - same as User */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email (optional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="name@example.com"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent bg-gray-700 text-white placeholder-gray-400 ${barberErrors.email ? 'border-red-300' : 'border-teal-mint'}`}
                />
                {barberErrors.email && <p className="mt-1 text-sm text-red-600">{barberErrors.email}</p>}
              </div>

              {/* Shop / Salon Name - barber only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shop / Salon name</label>
                <input
                  type="text"
                  value={formData.shopName}
                  onChange={(e) => handleInputChange('shopName', e.target.value)}
                  placeholder="Enter your shop or salon name"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent bg-gray-700 text-white placeholder-gray-400 ${barberErrors.shopName ? 'border-red-300' : 'border-teal-mint'}`}
                />
                {barberErrors.shopName && <p className="mt-1 text-sm text-red-600">{barberErrors.shopName}</p>}
              </div>

              {/* Shop Address - barber only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shop address</label>
                <textarea
                  value={formData.shopAddress}
                  onChange={(e) => handleInputChange('shopAddress', e.target.value)}
                  placeholder="Enter full shop address (Area, City, Pincode)"
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent bg-gray-700 text-white placeholder-gray-400 resize-none ${barberErrors.shopAddress ? 'border-red-300' : 'border-teal-mint'}`}
                />
                {barberErrors.shopAddress && <p className="mt-1 text-sm text-red-600">{barberErrors.shopAddress}</p>}
              </div>

              {/* Categories - barber only, same selector UI */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => {
                    const isSelected = selectedCategories.includes(category.id)
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => toggleCategory(category.id)}
                        className={`p-3 rounded-lg border text-left text-sm transition-colors ${
                          isSelected ? 'border-teal-mint bg-teal-mint/10 text-gray-800' : 'border-gray-300 bg-gray-100 text-gray-700 hover:border-teal-mint/50'
                        }`}
                      >
                        <span className="mr-2">{category.icon}</span>
                        {category.label}
                      </button>
                    )
                  })}
                </div>
                {barberErrors.categories && <p className="mt-1 text-sm text-red-600">{barberErrors.categories}</p>}
              </div>

              {/* Password - same as User */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Create a strong password"
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent bg-gray-700 text-white placeholder-gray-400 ${barberErrors.password ? 'border-red-300' : 'border-teal-mint'}`}
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
                {barberErrors.password && <p className="mt-1 text-sm text-red-600">{barberErrors.password}</p>}
              </div>

              {/* Confirm Password - barber only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent bg-gray-700 text-white placeholder-gray-400 ${barberErrors.confirmPassword ? 'border-red-300' : 'border-teal-mint'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                {barberErrors.confirmPassword && <p className="mt-1 text-sm text-red-600">{barberErrors.confirmPassword}</p>}
              </div>
            </div>

            {(barberErrors.submit || checkoutError) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{barberErrors.submit || checkoutError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!isBarberFormValid() || loading}
              className="w-full bg-teal-mint text-white py-3 rounded-lg font-medium transition-opacity mb-4 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registering...' : 'Register as Barber'}
            </button>
          </form>
        )}

        {/* Form Fields - User only (Barber uses /barber/register) */}
        {userType === 'User' && (
        <>
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
        </>
        )}

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

        {/* Sign up & continue Button - User only */}
        {userType === 'User' && (
        <button
          onClick={handleSignup}
          disabled={loading || success}
          className={`w-full bg-teal-mint text-white py-3 rounded-lg font-medium transition-opacity mb-4 ${
            loading || success ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
          }`}
        >
          {loading ? 'Creating account...' : success ? 'Registered Successfully!' : 'Sign up & continue'}
        </button>
        )}

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
