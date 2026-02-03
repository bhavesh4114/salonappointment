import React from 'react'
import { Bell, Search } from 'lucide-react'

const AdminHeader = () => {
  return (
    <header className="admin-header sticky top-0 z-30 h-16 bg-white/95 backdrop-blur border-b border-slate-200/80 shadow-sm flex items-center px-6 gap-4">
      {/* Left spacer to balance centered search */}
      <div className="w-52" />

      {/* Center search */}
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-[420px] relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="search"
            placeholder="Global search (CMD+K)"
            className="w-full pl-9 pr-3 py-2 rounded-full bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4 w-52 justify-end">
        <button
          type="button"
          className="relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white px-0.5">
            3
          </span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=80&h=80&q=80"
              alt="Super Admin"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-xs font-medium text-slate-900 leading-tight">Super Admin</span>
            <span className="text-[11px] text-slate-500 leading-tight">Marketplace Oversight</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader

