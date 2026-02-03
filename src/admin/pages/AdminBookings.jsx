import React from 'react'
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

const statsCards = [
  {
    label: 'Total Bookings Today',
    value: '42',
    growth: '+5%',
    type: 'growth',
  },
  {
    label: 'Pending Approvals',
    value: '8',
    badge: 'ATTENTION',
    type: 'attention',
  },
  {
    label: 'Total Revenue',
    value: '$1,240',
    growth: '+12%',
    type: 'growth',
  },
  {
    label: 'Booking Trend (7d)',
    type: 'chart',
    bars: [28, 35, 42, 38, 52, 48, 65],
  },
]

const bookings = [
  {
    id: 1,
    bookingId: '#BK-9921',
    userName: 'Michael Chen',
    userInitials: 'MC',
    barber: 'Marco Polo',
    service: 'Fade & Beard Trim',
    scheduleDate: 'Oct 24, 2023',
    scheduleTime: '10:30 AM',
    amount: '$45.00',
    paymentStatus: 'PAID',
    status: 'Approved',
  },
  {
    id: 2,
    bookingId: '#BK-9922',
    userName: 'Sarah Jenkins',
    userInitials: 'SJ',
    barber: 'James Cutter',
    service: 'Classic Haircut',
    scheduleDate: 'Oct 24, 2023',
    scheduleTime: '11:15 AM',
    amount: '$35.00',
    paymentStatus: 'UNPAID',
    status: 'Pending',
  },
  {
    id: 3,
    bookingId: '#BK-9918',
    userName: 'David Wilson',
    userInitials: 'DW',
    barber: 'Marco Polo',
    service: 'Buzz Cut & Shampoo',
    scheduleDate: 'Oct 24, 2023',
    scheduleTime: '09:00 AM',
    amount: '$28.00',
    paymentStatus: 'PAID',
    status: 'Completed',
  },
  {
    id: 4,
    bookingId: '#BK-9915',
    userName: 'Alex Rivera',
    userInitials: 'AR',
    barber: 'S. Razor',
    service: 'Hot Towel Shave',
    scheduleDate: 'Oct 23, 2023',
    scheduleTime: '03:45 PM',
    amount: '$25.00',
    paymentStatus: 'REFUNDED',
    status: 'Cancelled',
  },
]

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
          <div className="w-full md:flex-1">
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="search"
                placeholder="Search by Booking ID, User, or Barber..."
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent min-w-[100px]">
              <option>Status: All</option>
              <option>Approved</option>
              <option>Pending</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <Calendar className="w-4 h-4" />
              Date Range
            </button>
            <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent min-w-[110px]">
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
            Showing <span className="font-semibold text-slate-700">1</span>–
            <span className="font-semibold text-slate-700">10</span> of{' '}
            <span className="font-semibold text-slate-700">248</span> bookings
          </p>

          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100"
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
