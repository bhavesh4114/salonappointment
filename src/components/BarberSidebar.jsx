import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutGrid, Calendar, Users, TrendingUp, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useBarberProfile } from '../hooks/useBarberProfile'

const BarberSidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { barberProfile } = useBarberProfile()
  const [isAvailable, setIsAvailable] = useState(true)

  // Get user name from auth context or barber profile
  const userName = user?.fullName || barberProfile?.fullName || 'Barber'
  const shopName = barberProfile?.shopName || 'The Gents Club'

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/barber/dashboard' },
    { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/barber/appointments' },
    { id: 'clients', label: 'Clients', icon: Users, path: '/barber/clients' },
    { id: 'earnings', label: 'Earnings', icon: TrendingUp, path: '/barber/earnings' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/barber/settings' }
  ]

  // Determine active menu based on current path
  const getActiveMenu = () => {
    const path = location.pathname

    if (path.startsWith('/barber/appointments')) return 'appointments'
    if (path.startsWith('/barber/clients')) return 'clients'
    if (path.startsWith('/barber/earnings')) return 'earnings'
    if (path.startsWith('/barber/settings')) return 'settings'
    if (path.startsWith('/barber/availability')) return 'availability'
    if (path.startsWith('/barber/dashboard')) return 'dashboard'

    return ''
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleMenuClick = (item) => {
    // Only navigate if not already on the same page
    if (location.pathname !== item.path) {
      navigate(item.path, { replace: true })
    }
  }

  const currentActiveMenu = getActiveMenu()

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col fixed top-0 left-0 h-screen z-[60] pointer-events-auto">
      {/* Logo Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-teal-mint flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-gray-800">{shopName}</span>
        </div>
        <p className="text-sm text-gray-500">Barber Dashboard</p>
      </div>

      {/* Available Toggle */}
      <div className="mb-6 bg-gray-100 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Available</span>
          <button
            onClick={() => setIsAvailable(!isAvailable)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-mint focus:ring-offset-2 ${
              isAvailable ? 'bg-teal-mint' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isAvailable ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1">
        <div className="space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon
            const isActive = currentActiveMenu === item.id
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => handleMenuClick(item)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-teal-mint text-white font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Barber Profile + Logout */}
      <div className="mt-auto pt-6 border-t border-gray-200 space-y-4">
        <div className="flex items-center gap-3">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={userName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-teal-mint flex items-center justify-center text-white font-semibold text-sm">
              {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">{userName}</p>
            <p className="text-xs text-teal-mint font-semibold uppercase">{shopName.toUpperCase()}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default BarberSidebar
