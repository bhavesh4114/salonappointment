import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  // Wait for auth hydration
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Checking admin access…</p>
      </div>
    )
  }

  // Not logged in at all -> send to main login page (admin uses same /login)
  if (!user) {
    return <Navigate to="/login" replace />
  }

  const role = user?.role ? String(user.role).toLowerCase() : ''

  // Logged in but not an admin -> send to public home
  if (role !== 'admin') {
    return <Navigate to="/" replace />
  }

  // Authenticated admin – render admin layout / nested routes
  return children ?? <Outlet />
}

export default AdminProtectedRoute

