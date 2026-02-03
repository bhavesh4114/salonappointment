import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import AdminHeader from '../components/AdminHeader'
import '../styles/admin-tailwind.css'

const AdminLayout = () => {
  return (
    <div className="admin-root bg-slate-50 text-slate-900">
      {/* Fixed sidebar */}
      <AdminSidebar />

      {/* Main column (header + content) */}
      <div className="admin-main flex flex-col min-h-screen flex-1 w-full pl-[260px]">
        <AdminHeader />

        <main className="admin-main-content flex-1 w-full overflow-y-auto px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout

