import React, { useState, useEffect, useCallback } from 'react'
import {
  Download,
  Search,
  Calendar,
  Eye,
  Check,
  XCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  MoreVertical,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const statusBadgeClass = (status) => {
  const s = status.toLowerCase()
  if (s === 'approved') return 'bg-emerald-50 text-emerald-600'
  if (s === 'pending') return 'bg-amber-50 text-amber-700'
  if (s === 'completed') return 'bg-teal-50 text-teal-600'
  if (s === 'cancelled') return 'bg-rose-50 text-rose-600'
  return 'bg-slate-100 text-slate-600'
}

const paymentStatusClass = (status) => {
  const s = status?.toLowerCase()
  if (s === 'paid') return 'text-emerald-600'
  if (s === 'unpaid') return 'text-slate-500'
  if (s === 'refunded') return 'text-slate-500'
  return 'text-slate-600'
}

const AdminBookings = () => {
  const { token } = useAuth()

  const [stats, setStats] = useState({
    totalToday: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
    trendLast7Days: [],
  })
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [barberFilter, setBarberFilter] = useState('')

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  })

  const authToken =
    token ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null)

  const fetchStats = useCallback(async () => {
    if (!authToken) return
    try {
      const res = await fetch(`${API_BASE}/api/admin/bookings/stats`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.success) return
      setStats((prev) => ({
        ...prev,
        ...data.stats,
      }))
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('AdminBookings stats error:', e)
    }
  }, [authToken])

  const fetchBookings = useCallback(async () => {
    if (!authToken) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', String(pagination.page))
      params.set('limit', String(pagination.limit))
      if (search.trim()) params.set('search', search.trim())
      if (statusFilter) params.set('status', statusFilter)
      if (barberFilter) params.set('barber', barberFilter)

      const res = await fetch(`${API_BASE}/api/admin/bookings?${params.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })

      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.success) {
        // eslint-disable-next-line no-console
        console.error('AdminBookings fetch error response:', {
          status: res.status,
          statusText: res.statusText,
          body: data,
        })
        throw new Error(data?.message || 'Failed to fetch bookings')
      }

      const apiBookings = data.data || []
      const mapped = apiBookings.map((b) => {
        const bookingId = `#BK-${String(b.id).padStart(4, '0')}`
        const userName = b.user?.fullName || 'Unknown User'
        const userInitials = userName
          .split(' ')
          .filter(Boolean)
          .map((n) => n[0])
          .join('')
        const barberName = b.barber?.fullName || 'Unknown Barber'
        const serviceName = b.services?.[0]?.service?.name || '—'

        const scheduleDate = new Date(b.appointmentDate)
        const scheduleDateLabel = scheduleDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })

        const amountNumber = Number(b.totalAmount || 0)
        const amount = `₹${amountNumber.toFixed(2)}`

        const rawPaymentStatus = b.paymentStatus || b.payment?.paymentStatus || ''
        const ps = String(rawPaymentStatus).toLowerCase()
        const paymentStatus =
          ps === 'completed' || ps === 'paid'
            ? 'PAID'
            : ps === 'refunded'
              ? 'REFUNDED'
              : 'UNPAID'

        const rawStatus = String(b.status || '').toLowerCase()
        let statusLabel = 'Pending'
        if (rawStatus === 'confirmed' || rawStatus === 'approved') statusLabel = 'Approved'
        else if (rawStatus === 'completed') statusLabel = 'Completed'
        else if (rawStatus === 'cancelled' || rawStatus === 'canceled') statusLabel = 'Cancelled'

        return {
          id: b.id,
          bookingId,
          userName,
          userInitials: userInitials || 'U',
          barber: barberName,
          service: serviceName,
          scheduleDate: scheduleDateLabel,
          scheduleTime: b.appointmentTime,
          amount,
          paymentStatus,
          status: statusLabel,
        }
      })

      setBookings(mapped)
      if (data.pagination) {
        setPagination((prev) => ({ ...prev, ...data.pagination }))
      } else if (typeof data.total === 'number') {
        setPagination((prev) => ({
          ...prev,
          total: data.total,
          totalPages: Math.ceil(data.total / prev.limit) || 1,
        }))
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('AdminBookings fetch error:', e)
      setError(e.message)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [authToken, pagination.page, pagination.limit, search, statusFilter, barberFilter])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setSearch(searchInput.trim())
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const goToPage = (p) => {
    if (p < 1 || p > pagination.totalPages) return
    setPagination((prev) => ({ ...prev, page: p }))
  }

  const statsCards = [
    {
      label: 'Total Bookings Today',
      value: String(stats.totalToday ?? 0),
      growth: '+5%',
      type: 'growth',
    },
    {
      label: 'Pending Approvals',
      value: String(stats.pendingApprovals ?? 0),
      badge: 'ATTENTION',
      type: 'attention',
    },
    {
      label: 'Total Revenue',
      value: `₹${Number(stats.totalRevenue || 0).toFixed(2)}`,
      growth: '+12%',
      type: 'growth',
    },
    {
      label: 'Booking Trend (7d)',
      type: 'chart',
      bars: (stats.trendLast7Days && stats.trendLast7Days.length
        ? stats.trendLast7Days
        : [0, 0, 0, 0, 0, 0, 0]),
    },
  ]

  const start = (pagination.page - 1) * pagination.limit + 1
  const end = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Bookings Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor, approve, and manage appointment workflows platform-wide.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
        >
          <Download className="w-4 h-4" />
          Export Bookings
        </button>
      </div>

      {/* Stats / insight cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statsCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl shadow-md border border-slate-100/80 px-5 py-4 flex flex-col justify-between min-h-[100px]"
          >
            {card.type === 'chart' ? (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {card.label}
                </p>
                <div className="flex items-end gap-1 h-12 mt-2">
                  {card.bars.map((h, i) => {
                    const max = Math.max(...card.bars)
                    return (
                      <div
                        key={i}
                        className="flex-1 min-w-[6px] rounded-t bg-slate-200 last:bg-teal-500 transition-all"
                        style={{ height: `${(h / max) * 100}%` }}
                      />
                    )
                  })}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {card.label}
                  </p>
                  {card.growth && (
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600 shrink-0">
                      <TrendingUp className="w-3 h-3" />
                      {card.growth}
                    </span>
                  )}
                  {card.badge && (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 shrink-0">
                      {card.badge}
                    </span>
                  )}
                </div>
                <p className="text-xl sm:text-2xl font-semibold text-slate-900 mt-1">
                  {card.value}
                </p>
              </>
            )}
          </div>
        ))}
      </section>

      {/* Search & filter */}
      <section className="bg-white rounded-xl shadow-md border border-slate-100/80 px-5 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
          <form onSubmit={handleSearchSubmit} className="w-full md:flex-1">
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="search"
                placeholder="Search by Booking ID, User, or Barber..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </form>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <select
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent min-w-[100px]"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
            >
              <option value="">Status: All</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <Calendar className="w-4 h-4" />
              Date Range
            </button>
            <select
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent min-w-[110px]"
              value={barberFilter}
              onChange={(e) => {
                const val = e.target.value
                setBarberFilter(val === 'All Barbers' ? '' : val)
                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
            >
              <option>All Barbers</option>
              <option>Marco Polo</option>
              <option>James Cutter</option>
              <option>S. Razor</option>
            </select>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              title="More filters"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Bookings table */}
      <section className="bg-white rounded-xl shadow-md border border-slate-100/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Booking ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Barber
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Service
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Schedule
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-4 py-3 align-middle font-medium text-slate-900">
                    {row.bookingId}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600 shrink-0">
                        {row.userInitials}
                      </div>
                      <span className="text-sm font-medium text-slate-900">
                        {row.userName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle text-sm text-slate-700">
                    {row.barber}
                  </td>
                  <td className="px-4 py-3 align-middle text-sm text-slate-700">
                    {row.service}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {row.scheduleDate}
                      </p>
                      <p className="text-xs text-slate-500">{row.scheduleTime}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {row.amount}
                      </p>
                      <p
                        className={`text-xs font-medium ${paymentStatusClass(
                          row.paymentStatus,
                        )}`}
                      >
                        {row.paymentStatus}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusBadgeClass(
                        row.status,
                      )}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          row.status === 'Approved'
                            ? 'bg-emerald-500'
                            : row.status === 'Pending'
                              ? 'bg-amber-500'
                              : row.status === 'Completed'
                                ? 'bg-teal-500'
                                : 'bg-rose-500'
                        }`}
                      />
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle text-right">
                    <div className="inline-flex items-center gap-1 justify-end">
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {row.status === 'Pending' && (
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-teal-600 hover:bg-teal-50 transition-colors"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {row.status !== 'Cancelled' && row.status !== 'Completed' && (
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                          title="Cancel"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/60">
          <p className="text-xs text-slate-500 uppercase tracking-wide">
            Showing <span className="font-semibold text-slate-700">{pagination.total ? start : 0}</span>–
            <span className="font-semibold text-slate-700">{end}</span> of{' '}
            <span className="font-semibold text-slate-700">{pagination.total.toLocaleString()}</span> bookings
          </p>

          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="h-8 w-8 rounded-full bg-teal-500 text-white text-xs font-semibold flex items-center justify-center"
            >
              1
            </button>
            <button
              type="button"
              className="h-8 w-8 rounded-full border border-slate-200 text-xs text-slate-600 hover:bg-slate-100"
            >
              2
            </button>
            <button
              type="button"
              className="h-8 w-8 rounded-full border border-slate-200 text-xs text-slate-600 hover:bg-slate-100"
            >
              3
            </button>
            <span className="px-1 text-xs text-slate-400 flex items-center">…</span>
            <button
              type="button"
              className="h-8 w-8 rounded-full border border-slate-200 text-xs text-slate-600 hover:bg-slate-100"
            >
              25
            </button>
            <button
              type="button"
              onClick={() => goToPage(pagination.page + 1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AdminBookings
