import React, { useEffect, useState, useMemo, useCallback } from 'react'
import {
  Download,
  FileSpreadsheet,
  CloudDownload,
  DollarSign,
  Scissors,
  Clock,
  Search,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const revenueTrendDataFallback = [
  { month: 'JAN', revenue: 0 },
  { month: 'FEB', revenue: 0 },
  { month: 'MAR', revenue: 0 },
  { month: 'APR', revenue: 0 },
  { month: 'MAY', revenue: 0 },
  { month: 'JUN', revenue: 0 },
  { month: 'JUL', revenue: 0 },
]

const transactionsFallback = []

const statusBadgeClass = (status) => {
  const s = status?.toLowerCase()
  if (s === 'completed') return 'bg-emerald-500 text-white'
  if (s === 'pending') return 'bg-amber-500 text-white'
  if (s === 'failed') return 'bg-rose-500 text-white'
  return 'bg-slate-200 text-slate-700'
}

const typeDotClass = (type) => {
  const t = type?.toLowerCase()
  if (t === 'payment') return 'bg-sky-500'
  if (t === 'payout') return 'bg-amber-500'
  if (t === 'refund') return 'bg-rose-500'
  return 'bg-slate-400'
}

const AdminFinance = () => {
  const { token } = useAuth()

  const [summary, setSummary] = useState({
    totalRevenue: 0,
    platformEarnings: 0,
    barberPayouts: 0,
    gstCollected: 0,
  })
  const [revenueTrend, setRevenueTrend] = useState(revenueTrendDataFallback)
  const [loading, setLoading] = useState(true)

  const authToken =
    token ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null)

  useEffect(() => {
    const fetchFinanceSummary = async () => {
      if (!authToken) return
      try {
        const res = await fetch(`${API_BASE}/api/admin/finance/summary`, {
          headers: { Authorization: `Bearer ${authToken}` },
        })
        const data = await res.json().catch(() => null)
        if (!res.ok || !data?.success) return

        if (data.summary) {
          setSummary({
            totalRevenue: Number(data.summary.totalRevenue || 0),
            platformEarnings: Number(data.summary.platformEarnings || 0),
            barberPayouts: Number(data.summary.barberPayouts || 0),
            gstCollected: Number(data.summary.gstCollected || 0),
          })
        }

        if (Array.isArray(data.revenueTrend) && data.revenueTrend.length) {
          const mapped = data.revenueTrend.map((item) => ({
            month: item.label,
            revenue: Number(item.revenue || 0) / 1000,
          }))
          setRevenueTrend(mapped)
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('AdminFinance summary fetch error:', e)
      } finally {
        setLoading(false)
      }
    }

    fetchFinanceSummary()
  }, [authToken])

  const formatCurrency = useCallback(
    (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
    [],
  )

  const summaryCards = useMemo(
    () => [
      {
        label: 'Total Revenue',
        value: formatCurrency(summary.totalRevenue),
        growth: '+12%',
        icon: DollarSign,
      },
      {
        label: 'Platform Earnings',
        value: formatCurrency(summary.platformEarnings),
        icon: DollarSign,
      },
      {
        label: 'Barber Payouts',
        value: formatCurrency(summary.barberPayouts),
        icon: Scissors,
      },
      {
        label: 'GST Collected',
        value: formatCurrency(summary.gstCollected),
        icon: Clock,
      },
    ],
    [summary, formatCurrency],
  )

  const payoutDistributionData = useMemo(
    () => [
      {
        name: 'Barber Share',
        value: summary.totalRevenue
          ? Math.max(
              0,
              Math.min(
                100,
                ((summary.totalRevenue - summary.platformEarnings) / summary.totalRevenue) * 100,
              ),
            )
          : 0,
        amount: formatCurrency(summary.totalRevenue - summary.platformEarnings),
        color: '#14b8a6',
      },
      {
        name: 'Platform Fee',
        value: summary.totalRevenue
          ? Math.max(
              0,
              Math.min(100, (summary.platformEarnings / summary.totalRevenue) * 100),
            )
          : 0,
        amount: formatCurrency(summary.platformEarnings),
        color: '#cbd5e1',
      },
    ],
    [summary, formatCurrency],
  )

  const transactions = transactionsFallback

  // 🔒 Guard while loading initial finance data
  if (loading) {
    return (
      <div className="p-6 text-slate-600">
        Loading finance data...
      </div>
    )
  }

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Finance & Payments
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage platform earnings, barber payouts, and transaction history.
          </p>
        </div>

        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
          >
            <CloudDownload className="w-4 h-4" />
            Download Statement
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Finance Report
          </button>
        </div>
      </div>

      {/* Finance summary cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl shadow-md border border-slate-100/80 px-5 py-4 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-600">
                  <Icon className="w-5 h-5" />
                </div>
                {card.growth && (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600">
                    {card.growth}
                  </span>
                )}
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {card.label}
                </p>
                <p className="text-xl font-semibold text-slate-900 mt-0.5">
                  {card.value}
                </p>
              </div>
            </div>
          )
        })}
      </section>

      {/* Filters */}
      <section className="bg-white rounded-xl shadow-md border border-slate-100/80 px-5 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-[180px]">
              <option>DATE RANGE: Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>Last 90 Days</option>
            </select>
            <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-[160px]">
              <option>TRANSACTION TYPE: All Types</option>
              <option>Payment</option>
              <option>Payout</option>
              <option>Refund</option>
            </select>
            <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-[140px]">
              <option>STATUS: All Statuses</option>
              <option>Completed</option>
              <option>Pending</option>
              <option>Failed</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-teal-500 bg-white px-4 py-2 text-sm font-medium text-teal-600 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
            >
              Apply Filters
            </button>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl shadow-md border border-slate-100/80 p-6 h-full flex flex-col min-h-[280px]">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block w-3 h-3 rounded-full bg-teal-500" />
            <h3 className="text-sm font-semibold text-slate-900">Revenue Trend</h3>
          </div>
          <div className="flex-1 min-h-[220px] h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueTrend}
                margin={{ top: 12, right: 12, left: 0, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(v) => `₹${v}k`}
                />
                <Bar
                  dataKey="revenue"
                  fill="#14b8a6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-slate-100/80 p-6 h-full flex flex-col min-h-[280px]">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Payout Distribution
          </h3>
          <div className="flex-1 flex items-center gap-4 min-h-[220px] h-72">
            <div className="relative flex-1 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={payoutDistributionData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={44}
                    outerRadius={64}
                    paddingAngle={2}
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {payoutDistributionData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">
                  Total Funds
                </p>
                <p className="text-lg font-bold text-slate-900">$114.7k</p>
              </div>
            </div>
            <div className="w-1/2 space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal-500" />
                <span className="text-xs text-slate-600">
                  BARBER SHARE 84% ($96,300)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span className="text-xs text-slate-600">
                  PLATFORM FEE 16% ($18,420)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Transactions table */}
      <section className="bg-white rounded-xl shadow-md border border-slate-100/80 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            Recent Transactions
          </h3>
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="search"
              placeholder="Search transactions..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Transaction ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Entity
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Type
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
              {transactions.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-4 py-3 align-middle font-medium text-slate-900">
                    {row.txnId}
                  </td>
                  <td className="px-4 py-3 align-middle text-slate-700">
                    {row.date}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600 shrink-0">
                        {row.entityInitials}
                      </div>
                      <span className="text-slate-900">{row.entity}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${typeDotClass(
                          row.type,
                        )}`}
                      />
                      <span className="text-slate-700">{row.type}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle font-semibold text-slate-900">
                    {row.amount}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusBadgeClass(
                        row.status,
                      )}`}
                    >
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
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/60">
          <p className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-700">1</span>–
            <span className="font-semibold text-slate-700">10</span> of{' '}
            <span className="font-semibold text-slate-700">320</span> transactions
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
              32
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

export default AdminFinance
