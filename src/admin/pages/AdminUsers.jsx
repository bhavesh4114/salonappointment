import React, { useState, useEffect, useCallback } from 'react'
import {
  Users,
  UserCog,
  Scissors,
  UserCircle,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const stats = [
  { label: 'Total Users', valueKey: 'totalUsers', delta: '+12%', icon: Users },
  { label: 'Active Users', valueKey: 'activeUsers', delta: '+5%', icon: UserCog },
]

function formatJoined(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatLastActive(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const roleBadgeClass = (role) => {
  const r = role.toLowerCase()
  if (r === 'admin') return 'bg-teal-50 text-teal-700 border border-teal-100'
  if (r === 'barber') return 'bg-sky-50 text-sky-700 border border-sky-100'
  if (r === 'customer') return 'bg-violet-50 text-violet-700 border border-violet-100'
  return 'bg-slate-50 text-slate-700 border border-slate-100'
}

const statusBadgeClass = (status) => {
  const s = status.toLowerCase()
  if (s === 'active') return 'bg-emerald-50 text-emerald-600'
  if (s === 'inactive') return 'bg-slate-100 text-slate-600'
  if (s === 'suspended') return 'bg-rose-50 text-rose-600'
  return 'bg-slate-50 text-slate-600'
}

const AdminUsers = () => {
  const { token } = useAuth()
  const [statsData, setStatsData] = useState({ totalUsers: 0, activeUsers: 0 })
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const authToken = token ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null)

  const fetchStats = useCallback(async () => {
    if (!authToken) return
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/stats`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      if (!res.ok) throw new Error('Failed to fetch stats')
      const data = await res.json()
      if (data.success && data.stats) setStatsData(data.stats)
    } catch (e) {
      console.error('Stats fetch error:', e)
    }
  }, [authToken])

  const fetchUsers = useCallback(async () => {
    if (!authToken) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', String(pagination.page))
      params.set('limit', String(pagination.limit))
      if (search.trim()) params.set('search', search.trim())
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`${API_BASE}/api/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      if (data.success) {
        setUsers(data.data || [])
        if (data.pagination) setPagination((prev) => ({ ...prev, ...data.pagination }))
      }
    } catch (e) {
      setError(e.message)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [authToken, pagination.page, pagination.limit, search, statusFilter])

  useEffect(() => { fetchStats() }, [fetchStats])
  useEffect(() => { fetchUsers() }, [fetchUsers])

  const goToPage = (p) => {
    if (p < 1 || p > pagination.totalPages) return
    setPagination((prev) => ({ ...prev, page: p }))
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setSearch(searchInput.trim())
    setPagination((prev) => ({ ...prev, page: 1 }))
  }


  const displayUsers = users.map((u) => ({
    id: u.id,
    name: u.fullName || '—',
    email: u.email || u.mobileNumber || '—',
    role: 'Customer',
    status: u.isActive ? 'Active' : 'Inactive',
    joined: formatJoined(u.createdAt),
    lastActive: formatLastActive(u.updatedAt),
  }))

  const start = (pagination.page - 1) * pagination.limit + 1
  const end = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor accounts, manage roles, and track platform activity.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-5">
        {stats.map(({ label, valueKey, value: staticValue, delta, icon: Icon }) => (
          <div
            key={label}
            className="bg-white rounded-xl shadow-md border border-slate-100/80 px-5 py-4 flex items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {label}
              </p>
              <p className="text-xl sm:text-2xl font-semibold text-slate-900">
                {valueKey ? (statsData[valueKey] ?? 0).toLocaleString() : staticValue}
              </p>
              <p className="text-[11px] text-emerald-600 font-medium">{delta} vs last period</p>
            </div>
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-500">
              <Icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </section>

      {/* Search + filters */}
      <section className="bg-white rounded-xl shadow-md border border-slate-100/80 px-5 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <form onSubmit={handleSearchSubmit} className="w-full md:flex-1">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="search"
              placeholder="Search users by name, email or ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </form>

        <div className="flex items-center gap-2 md:gap-3">
          <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
            <option>Role: All</option>
            <option>Admin</option>
            <option>Barber</option>
            <option>Customer</option>
          </select>
          <select
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPagination((prev) => ({ ...prev, page: 1 }))
            }}
          >
            <option value="">Status: All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Users table */}
      <section className="bg-white rounded-xl shadow-md border border-slate-100/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
              <tr>
                <th className="w-10 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Joined Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Last Active
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Loading users…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-rose-600">
                    {error}
                  </td>
                </tr>
              ) : (
                displayUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-4 py-3 align-middle">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500"
                      />
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200/80 overflow-hidden flex items-center justify-center text-xs font-semibold text-slate-600">
                          {user.name
                            .split(' ')
                            .filter(Boolean)
                            .map((n) => n[0])
                            .join('') || '?'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900">{user.name}</span>
                          <span className="text-xs text-slate-500">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${roleBadgeClass(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBadgeClass(user.status)}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-slate-700">
                      {user.joined}
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-slate-700">
                      {user.lastActive}
                    </td>
                    <td className="px-4 py-3 align-middle text-right">
                      <div className="inline-flex items-center gap-1.5 text-slate-400">
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100 hover:text-slate-700"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100 hover:text-slate-700"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/60">
          <p className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-700">{pagination.total ? start : 0}</span> to{' '}
            <span className="font-semibold text-slate-700">{end}</span> of{' '}
            <span className="font-semibold text-slate-700">{pagination.total.toLocaleString()}</span> users
          </p>

          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const p = i + 1
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => goToPage(p)}
                  className={`h-8 w-8 rounded-full text-xs font-semibold flex items-center justify-center ${
                    pagination.page === p ? 'bg-teal-500 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              )
            })}
            {pagination.totalPages > 5 && (
              <span className="px-1 text-xs text-slate-400">…</span>
            )}
            <button
              type="button"
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AdminUsers

