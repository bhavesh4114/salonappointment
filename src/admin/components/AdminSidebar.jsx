import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UserCog,
  Lock,
  Scissors,
  CalendarRange,
  Wallet2,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Barbers', to: '/admin/barbers', icon: UserCog },
  { label: 'Permissions', to: '/admin/permissions', icon: Lock },
  { label: 'Services', to: '/admin/services', icon: Scissors },
  { label: 'Bookings', to: '/admin/bookings', icon: CalendarRange },
  { label: 'Finance', to: '/admin/finance', icon: Wallet2 },
  { label: 'Reports', to: '/admin/reports', icon: BarChart3 },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
]

const AdminSidebar = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <aside className="admin-sidebar fixed inset-y-0 left-0 w-[260px] bg-white border-r border-slate-200/80 z-40 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-200/80">
        <span className="text-lg font-semibold tracking-tight text-slate-900">
          Barber<span className="text-teal-500">Market</span>
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map(({ label, to, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/admin/dashboard'}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-teal-500 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  ].join(' ')
                }
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  )
}

export default AdminSidebar

