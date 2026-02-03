import React from 'react'
import {
  Download,
  FileOutput,
  BarChart3,
  Calendar,
  Users,
  DollarSign,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Check,
  Calendar as CalendarIcon,
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const summaryCards = [
  {
    label: 'Total Revenue',
    value: '$124,000',
    growth: '+12% vs last month',
    positive: true,
    icon: BarChart3,
  },
  {
    label: 'Total Bookings',
    value: '1,248',
    growth: '+5.4% vs last month',
    positive: true,
    icon: Calendar,
  },
  {
    label: 'Active Users',
    value: '8,241',
    growth: '+8% vs last month',
    positive: true,
    icon: Users,
  },
  {
    label: 'Avg Booking Value',
    value: '$42.50',
    growth: '-2% vs last month',
    positive: false,
    icon: DollarSign,
  },
]

const revenueTrendData = [
  { day: 'MON', current: 18, previous: 14 },
  { day: 'TUE', current: 22, previous: 18 },
  { day: 'WED', current: 20, previous: 19 },
  { day: 'THU', current: 26, previous: 21 },
  { day: 'FRI', current: 30, previous: 24 },
  { day: 'SAT', current: 28, previous: 22 },
  { day: 'SUN', current: 24, previous: 20 },
]

const bookingsBreakdownData = [
  { name: 'Haircuts', value: 60, color: '#14b8a6' },
  { name: 'Beard Trim', value: 25, color: '#38bdf8' },
  { name: 'Other', value: 15, color: '#64748b' },
]

const generatedReports = [
  {
    id: 1,
    name: 'Monthly Revenue Q1',
    reportId: 'REP-8821',
    category: 'Revenue',
    dateRange: 'Jan 1 - Mar 31, 2024',
    generatedOn: 'Apr 12, 2024',
    status: 'Completed',
  },
  {
    id: 2,
    name: 'Active Stylist Analytics',
    reportId: 'REP-8820',
    category: 'Staff',
    dateRange: 'Feb 1 - Feb 28, 2024',
    generatedOn: 'Apr 11, 2024',
    status: 'Processing',
  },
  {
    id: 3,
    name: 'Annual User Retention',
    reportId: 'REP-8819',
    category: 'Users',
    dateRange: 'Jan 1 - Dec 31, 2023',
    generatedOn: 'Apr 10, 2024',
    status: 'Failed',
  },
  {
    id: 4,
    name: 'Commission Payouts',
    reportId: 'REP-8818',
    category: 'Finance',
    dateRange: 'Mar 1 - Mar 31, 2024',
    generatedOn: 'Apr 09, 2024',
    status: 'Completed',
  },
]

const statusBadgeClass = (status) => {
  const s = status?.toLowerCase()
  if (s === 'completed') return 'bg-emerald-500 text-white'
  if (s === 'processing') return 'bg-amber-500 text-white'
  if (s === 'failed') return 'bg-rose-500 text-white'
  return 'bg-slate-200 text-slate-700'
}

const AdminReports = () => {
  return (
    <div className="space-y-7">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor your platform's performance and generate detailed reports.
          </p>
        </div>

        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
          >
            <FileOutput className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Summary stat cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl shadow-md border border-slate-100/80 px-5 py-4 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-sky-100 text-sky-600">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {card.label}
                </p>
                <p className="text-xl font-semibold text-slate-900 mt-0.5">
                  {card.value}
                </p>
                <p
                  className={`inline-flex items-center gap-0.5 text-[11px] font-medium mt-1 ${
                    card.positive ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {card.positive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {card.growth}
                </p>
              </div>
            </div>
          )
        })}
      </section>

      {/* Filters */}
      <section className="bg-white rounded-xl shadow-md border border-slate-100/80 px-5 py-4">
        <p className="text-sm font-semibold text-slate-900 mb-3">Filters</p>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          <div className="relative flex-1 min-w-0 max-w-[240px]">
            <input
              type="text"
              readOnly
              value="Jan 1, 2024 – Jan 31, 2024"
              className="w-full h-10 pl-3 pr-9 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 pointer-events-none">
              <CalendarIcon className="w-4 h-4" />
            </span>
          </div>
          <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-[160px]">
            <option>Revenue Analysis</option>
            <option>Bookings Analysis</option>
            <option>User Analytics</option>
          </select>
          <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-[140px]">
            <option>All Statuses</option>
            <option>Completed</option>
            <option>Processing</option>
            <option>Failed</option>
          </select>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
          >
            <Check className="w-4 h-4" />
            Apply Filters
          </button>
        </div>
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl shadow-md border border-slate-100/80 p-6 h-full flex flex-col min-h-[280px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Revenue Trend
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal-500" />
                <span className="text-xs text-slate-600">Current Month</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span className="text-xs text-slate-600">Previous Month</span>
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueTrendData}
                margin={{ top: 12, right: 12, left: 0, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(v) => `$${v}k`}
                />
                <Line
                  type="monotone"
                  dataKey="current"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="previous"
                  stroke="#cbd5e1"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-slate-100/80 p-6 h-full flex flex-col min-h-[280px]">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Bookings Breakdown
          </h3>
          <div className="flex-1 flex items-center gap-4 min-h-[220px]">
            <div className="relative flex-1 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingsBreakdownData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={44}
                    outerRadius={64}
                    paddingAngle={2}
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {bookingsBreakdownData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">
                  Total
                </p>
                <p className="text-lg font-bold text-slate-900">1.2k</p>
              </div>
            </div>
            <div className="w-1/2 space-y-2">
              {bookingsBreakdownData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Generated Reports table */}
      <section className="bg-white rounded-xl shadow-md border border-slate-100/80 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            Generated Reports
          </h3>
          <select className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-auto min-w-[160px]">
            <option>Sort by: Newest First</option>
            <option>Sort by: Oldest First</option>
            <option>Sort by: Name</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Report Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Date Range
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Generated On
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
              {generatedReports.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-4 py-3 align-middle">
                    <div>
                      <p className="font-medium text-slate-900">{row.name}</p>
                      <p className="text-xs text-slate-500">ID {row.reportId}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle text-slate-700">
                    {row.category}
                  </td>
                  <td className="px-4 py-3 align-middle text-slate-700">
                    {row.dateRange}
                  </td>
                  <td className="px-4 py-3 align-middle text-slate-700">
                    {row.generatedOn}
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
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
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
            <span className="font-semibold text-slate-700">42</span> reports
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
              5
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

export default AdminReports
