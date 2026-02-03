import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import UserHeader from './UserHeader'

/**
 * Public/guest navbar. When user is logged in, show same header as dashboard (UserHeader).
 */
const Navbar = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <UserHeader />
  }

  return (
    <nav className="flex items-center justify-between px-4 md:px-8 py-4 bg-white border-b border-gray-100">
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

      <div className="hidden md:flex items-center gap-6 lg:gap-8">
        <button type="button" onClick={() => navigate('/services')} className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors">
          Services
        </button>
        <button type="button" onClick={() => navigate('/#how-it-works')} className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors">
          How It Works
        </button>
        <button type="button" onClick={() => navigate('/signup')} className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors">
          Become a Barber
        </button>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="px-3 md:px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-xs md:text-sm font-medium transition-colors"
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => navigate('/signup')}
          className="px-3 md:px-4 py-2 text-white bg-teal-mint rounded-full hover:opacity-90 text-xs md:text-sm font-medium transition-opacity"
        >
          Sign Up
        </button>
      </div>
    </nav>
  )
}

export default Navbar
