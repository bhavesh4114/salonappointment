import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { flushSync } from "react-dom";
import { useEffect } from "react";

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, user, loading: authLoading } = useAuth()

  const [userType, setUserType] = useState('User')
  const [loginMethod, setLoginMethod] = useState('OTP')
  const [inputValue, setInputValue] = useState('')
  const [passwordValue, setPasswordValue] = useState('')
  const [showPasswordField, setShowPasswordField] = useState(false)
  const [mobileNumber, setMobileNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
useEffect(() => {
  if (!authLoading && user) {
    const role = user?.role ? String(user.role).toLowerCase() : ''
    const from = location.state?.from
    const bookingState = location.state?.bookingState

    if (role === 'admin') {
      navigate('/admin/dashboard', { replace: true })
    } else if (role === 'barber') {
      navigate('/barber/dashboard', { replace: true })
    } else if (from === '/booking' && bookingState) {
      navigate(from, { state: bookingState, replace: true })
    } else {
      navigate('/', { replace: true })
    }
  }
}, [user, authLoading, navigate, location.state])





  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-8 relative">
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
      <div className="bg-white rounded-lg shadow-md w-full max-w-md p-8">
        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Login to continue
        </h1>
        
        {/* Subtext */}
        <p className="text-gray-600 mb-8 text-sm">
          Manage your grooming appointments seamlessly.
        </p>

        {/* LOGIN AS Label */}
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          LOGIN AS
        </p>

        {/* Role Selector Toggle */}
        <div className="bg-gray-100 rounded-full p-1 flex mb-8">
          <button
            onClick={() => setUserType('User')}
            className={`flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-colors ${
              userType === 'User'
                ? 'bg-gray-800 text-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            User
          </button>
          <button
            onClick={() => setUserType('Barber')}
            className={`flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-colors ${
              userType === 'Barber'
                ? 'bg-gray-800 text-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Barber
          </button>
        </div>

        {/* Login Method Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => {
              setLoginMethod('OTP')
              setShowPasswordField(false)
              setPasswordValue('')
            }}
            className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${
              loginMethod === 'OTP' && !showPasswordField
                ? 'text-gray-800'
                : 'text-gray-600'
            }`}
          >
            Login with OTP
            {loginMethod === 'OTP' && !showPasswordField && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-mint"></span>
            )}
          </button>
          <button
            onClick={() => {
              setLoginMethod('Password')
              setShowPasswordField(true)
            }}
            className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${
              loginMethod === 'Password' || showPasswordField
                ? 'text-gray-800'
                : 'text-gray-600'
            }`}
          >
            Password
            {(loginMethod === 'Password' || showPasswordField) && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-mint"></span>
            )}
          </button>
        </div>

        {/* Input Fields */}
        <div className="mb-6 space-y-4">
          {!showPasswordField ? (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile number or Email
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="e.g. +91 992 345 6789 or email@example.com"
                className="w-full px-4 py-3 border border-teal-mint rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
              />
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email or Mobile number
                </label>
                <input
                  type="text"
                  value={mobileNumber || inputValue}
                  onChange={(e) => {
                    const v = e.target.value
                    setInputValue(v)
                    setMobileNumber(v)
                  }}
                  placeholder="e.g. admin@gmail.com or +91 992 345 6789"
                  className="w-full px-4 py-3 border border-teal-mint rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-teal-mint rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                />
              </div>
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={async () => {
            if (!showPasswordField && loginMethod === 'OTP' && inputValue.trim()) {
              // Save mobile number and switch to password field
              setMobileNumber(inputValue)
              setShowPasswordField(true)
              setLoginMethod('Password')
            } else if (showPasswordField) {
              const loginIdentifier = (mobileNumber || inputValue).trim()
              if (!loginIdentifier) {
                setError('Please enter your email or mobile number.')
                return
              }
              if (!passwordValue.trim()) {
                setError('Please enter your password.')
                return
              }
              // Handle login with email/mobile + password
              setLoading(true)
              setError('')

              try {
                // Determine API endpoint based on user type
                const apiEndpoint = userType === 'Barber' 
                  ? 'http://localhost:5000/api/barber/login'
                  : 'http://localhost:5000/api/auth/login'

                const response = await fetch(apiEndpoint, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    mobileNumber: loginIdentifier.includes('@') ? undefined : loginIdentifier,
                    email: loginIdentifier.includes('@') ? loginIdentifier : undefined,
                    password: passwordValue
                  })
                })

                const data = await response.json()

                if (!response.ok) {
                  if (response.status === 403 && data.code === 'SUBSCRIPTION_INACTIVE') {
                    setError(data.message || 'Subscription inactive. Please update your payment.')
                    setLoading(false)
                    setTimeout(() => navigate('/barber/register', { state: { subscriptionInactive: true } }), 2000)
                    return
                  }
                  if (response.status === 401) {
                    setError(data.message || 'Invalid credentials. Please check your mobile number/email and password.')
                  } else {
                    setError(data.message || 'Login failed')
                  }
                  setLoading(false)
                  return
                }
if (data.token) {
  const loggedInUser = data.user || data.barber;
  console.log("✅ LOGIN SUCCESS", loggedInUser);
  login(data.token, loggedInUser);
  setLoading(false);
  return;
}




              } catch (err) {
                console.error('Login error:', err)
                setError('Network error. Please check if the backend server is running.')
                setLoading(false)
              }
            }
          }}
          disabled={loading}
          className={`w-full bg-teal-mint text-white py-3 rounded-lg font-medium transition-opacity mb-4 ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
          }`}
        >
          {loading ? 'Logging in...' : 'Continue'}
        </button>

        {/* Sign Up Link */}
        <div className="text-center mb-6">
          <span className="text-sm text-gray-600">
            New here?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-teal-mint font-medium hover:underline"
            >
              Sign up
            </button>
          </span>
        </div>

        {/* Footer Terms */}
        <div className="text-center pt-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            By clicking 'Continue', you agree to our{' '}
            <button className="text-teal-mint hover:underline">Terms of Service</button>
            {' '}&{' '}
            <button className="text-teal-mint hover:underline">Privacy Policy</button>
            .
          </p>
        </div>
      </div>

      {/* Bottom Right Icon */}
      <div className="absolute bottom-4 right-4 flex flex-col items-center">
        <svg 
          className="w-6 h-6 text-gray-400 mb-1" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" 
          />
        </svg>
        <p className="text-xs text-gray-400">
          MADE WITH BARBERPRO.NET
        </p>
      </div>
    </div>
  )
}

export default Login
