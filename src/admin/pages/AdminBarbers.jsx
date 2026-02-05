import React, { useState, useEffect, useCallback } from 'react'
import { Users, UserCheck, AlertOctagon, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const statusBadgeClass = (status) => {
  const s = status.toLowerCase()
  if (s === 'active') return 'bg-emerald-50 text-emerald-600'
  if (s === 'suspended') return 'bg-rose-50 text-rose-600'
  return 'bg-slate-100 text-slate-600'
}

const formatJoined = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const AdminBarbers = () => {
  const { token } = useAuth()
  const [stats, setStats] = useState({ totalBarbers: 0, activeBarbers: 0, suspendedBarbers: 0 })
  const [barbers, setBarbers] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const authToken =
    token ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null)

  const fetchStats = useCallback(async () => {
    if (!authToken) return
    try {
      const res = await fetch(`${API_BASE}/api/admin/barbers/stats`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      if (!res.ok) throw new Error('Failed to fetch barber stats')
      const data = await res.json()
      if (data.success && data.stats) setStats(data.stats)
    } catch (e) {
      console.error('Admin barber stats error:', e)
    }
  }, [authToken])

  const fetchBarbers = useCallback(async () => {
    if (!authToken) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', String(pagination.page))
      params.set('limit', String(pagination.limit))
      if (search.trim()) params.set('search', search.trim())

      const res = await fetch(`${API_BASE}/api/admin/barbers?${params.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })

      let data
      try {
        data = await res.json()
      } catch {
        data = null
      }

      if (!res.ok || !data?.success) {
        console.error('Admin fetchBarbers error response:', {
          status: res.status,
          statusText: res.statusText,
          body: data,
        })
        const message =
          data?.message || `Request failed with status ${res.status} (${res.statusText})`
        throw new Error(message)
      }

      setBarbers(data.data || [])
      if (data.pagination) {
        setPagination((prev) => ({ ...prev, ...data.pagination }))
      } else if (typeof data.total === 'number') {
        // Fallback if only total is provided
        setPagination((prev) => ({
          ...prev,
          total: data.total,
          totalPages: Math.ceil(data.total / prev.limit) || 1,
        }))
      }
    } catch (e) {
      console.error('Admin fetchBarbers error (frontend):', e)
      setError(e.message)
      setBarbers([])
    } finally {
      setLoading(false)
    }
  }, [authToken, pagination.page, pagination.limit, search])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    fetchBarbers()
  }, [fetchBarbers])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setSearch(searchInput.trim())
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const goToPage = (p) => {
    if (p < 1 || p > pagination.totalPages) return
    setPagination((prev) => ({ ...prev, page: p }))
  }

  const start = (pagination.page - 1) * pagination.limit + 1
  const end = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Barber Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage and monitor all registered barbers across the platform.
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl shadow-md border border-slate-100/80 px-5 py-4 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              TOTAL BARBERS
            </p>
            <p className="text-2xl font-semibold text-slate-900">
              {stats.totalBarbers.toLocaleString()}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium">+12% from last month</p>
          </div>
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-teal-50 text-teal-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-slate-100/80 px-5 py-4 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              ACTIVE BARBERS
            </p>
            <p className="text-2xl font-semibold text-slate-900">
              {stats.activeBarbers.toLocaleString()}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium">91% of total base</p>
          </div>
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 text-emerald-600">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-slate-100/80 px-5 py-4 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              SUSPENDED
            </p>
            <p className="text-2xl font-semibold text-slate-900">
              {stats.suspendedBarbers.toLocaleString()}
            </p>
            <p className="text-[11px] text-rose-600 font-medium">Requires attention</p>
          </div>
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-rose-50 text-rose-600">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* Search + status filter */}
      <section className="bg-white rounded-xl shadow-md border border-slate-100/80 px-5 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <form onSubmit={handleSearchSubmit} className="w-full md:flex-1">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="search"
              placeholder="Search barbers by name, email or shop name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </form>

        <div className="flex items-center gap-2 md:gap-3">
          <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
            <option>All Statuses</option>
            <option>Active</option>
            <option>Suspended</option>
          </select>
        </div>
      </section>

      {/* Barbers table */}
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
                  Barber
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Shop Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Shop Address
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Joined Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Loading barbers…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-rose-600">
                    {error}
                  </td>
                </tr>
              ) : (
                barbers.map((b) => (
                  <tr
                    key={b.id}
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
                          {b.fullName
                            ?.split(' ')
                            .filter(Boolean)
                            .map((n) => n[0])
                            .join('') || '?'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900">
                            {b.fullName || '—'}
                          </span>
                          <span className="text-xs text-slate-500">
                            {b.email || b.mobileNumber || '—'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-slate-700">
                      {b.shopName || '—'}
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-slate-700">
                      {b.shopAddress || '—'}
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-slate-700">
                      {formatJoined(b.createdAt)}
                    </td>
                    <td className="px-4 py-3 align-middle text-right">
                      <div className="inline-flex items-center gap-3 text-xs">
                        <button type="button" className="text-teal-600 hover:underline">
                          View
                        </button>
                        <button type="button" className="text-slate-500 hover:underline">
                          Edit
                        </button>
                        <button type="button" className="text-rose-500 hover:underline">
                          Suspend
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
            <span className="font-semibold text-slate-700">{pagination.total.toLocaleString()}</span> barbers
          </p>

          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const p = i + 1
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => goToPage(p)}
                  className={`h-8 w-8 rounded-full text-xs font-semibold flex items-center justify-center ${
                    pagination.page === p
                      ? 'bg-teal-500 text-white'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
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
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AdminBarbers

