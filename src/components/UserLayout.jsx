import React from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import UserHeader from './UserHeader'
import Navbar from './Navbar'

/**
 * Layout for user-facing pages: same header (UserHeader when logged in, Navbar when not) + page content.
 * Used with nested routes so the header does not re-mount on navigation.
 * Protected routes (wrapped in UserProtectedRoute) always see UserHeader; public routes see header by auth state.
 */
const UserLayout = () => {
  const { isAuthenticated } = useAuth()
  return (
    <>
      {isAuthenticated ? <UserHeader /> : <Navbar />}
      <Outlet />
    </>
  )
}

export default UserLayout
