import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    navigate('/')
  }

  const handleDashboard = () => {
    setDropdownOpen(false)
    navigate('/')
  }

  const handleEditProfile = () => {
    setDropdownOpen(false)
    navigate('/profile/edit')
  }

  // 👉 ADD THIS FUNCTION BELOW
  const handleMyBookings = () => {
    setDropdownOpen(false)
    navigate('/my-bookings')
  }

  // Get user avatar or default
  const getAvatarUrl = () => {
    if (user?.avatar) {
      return user.avatar
    }
    // Default avatar - first letter of name or default icon
    return null
  }

  // Get user initials for default avatar
  const getUserInitials = () => {
    if (user?.fullName) {
      return user.fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return 'U'
  }

  return (
    <nav className="flex items-center justify-between px-4 md:px-8 py-4 bg-white border-b border-gray-100">
      {/* Logo */}
      <div 
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate('/')}
      >
        <div className="w-8 h-8 rounded-lg bg-teal-mint flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
          </svg>
        </div>
        <span className="text-lg md:text-xl font-semibold text-gray-800">BarberPro</span>
      </div>

      {/* Navigation Links - Hidden on mobile */}
      <div className="hidden md:flex items-center gap-6 lg:gap-8">
        <a href="#" className="text-gray-700 hover:text-gray-900 text-sm">Services</a>
        <a href="#" className="text-gray-700 hover:text-gray-900 text-sm">How It Works</a>
        <a href="#" className="text-gray-700 hover:text-gray-900 text-sm">Become a Barber</a>
        <a href="#" className="text-gray-700 hover:text-gray-900 text-sm">Barbers</a>
      </div>

      {/* Right Side - Auth Buttons or Profile */}
      <div className="flex items-center gap-2 md:gap-4">
        {!isAuthenticated ? (
          <>
            <button 
              onClick={() => navigate('/login')}
              className="px-3 md:px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-xs md:text-sm font-medium transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="px-3 md:px-4 py-2 text-white bg-teal-mint rounded-full hover:opacity-90 text-xs md:text-sm font-medium transition-opacity"
            >
              Sign Up
            </button>
          </>
        ) : (
          <div className="relative" ref={dropdownRef}>
            {/* Profile Avatar */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-mint text-white font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-teal-mint focus:ring-offset-2"
            >
              {getAvatarUrl() ? (
                <img 
                  src={getAvatarUrl()} 
                  alt={user?.fullName || 'User'} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold">{getUserInitials()}</span>
              )}
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Dashboard */}
                <button
                  onClick={handleDashboard}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </button>
                {/* My Bookings */}
<button
  onClick={handleMyBookings}
  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
>
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
  My Bookings
</button>


                {/* Edit Profile */}
                <button
                  onClick={handleEditProfile}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Edit Profile
                </button>

                {/* Divider */}
                <div className="border-t border-gray-100 my-1"></div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
