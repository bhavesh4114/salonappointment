import React, { useEffect, useState, useMemo } from 'react'
import { ArrowUpRight, Users, Clock, AlertTriangle, DollarSign } from 'lucide-react'
import AdminStatCard from '../components/AdminStatCard'
import RevenueGrowthChart from '../components/charts/RevenueGrowthChart'
import BookingDistributionChart from '../components/charts/BookingDistributionChart'
import { useAuth } from '../../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const AdminDashboard = () => {
  const { token } = useAuth()

  const [financeSummaryAllTime, setFinanceSummaryAllTime] = useState({
    totalRevenue: 0,
    platformEarnings: 0,
  })

  const [financeSummaryLast30, setFinanceSummaryLast30] = useState({
    totalRevenue: 0,
    platformEarnings: 0,
  })

  const authToken =
    token ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null)

  useEffect(() => {
    const fetchFinance = async () => {
      if (!authToken) return
      try {
        const [allTimeRes, last30Res] = await Promise.all([
          fetch(`${API_BASE}/api/admin/finance/summary`, {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          fetch(`${API_BASE}/api/admin/finance/summary?range=last30`, {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
        ])

        const allTimeData = await allTimeRes.json().catch(() => null)
        const last30Data = await last30Res.json().catch(() => null)

        if (allTimeRes.ok && allTimeData?.success && allTimeData.summary) {
          setFinanceSummaryAllTime({
            totalRevenue: Number(allTimeData.summary.totalRevenue || 0),
            platformEarnings: Number(allTimeData.summary.platformEarnings || 0),
          })
        }

        if (last30Res.ok && last30Data?.success && last30Data.summary) {
          setFinanceSummaryLast30({
            totalRevenue: Number(last30Data.summary.totalRevenue || 0),
            platformEarnings: Number(last30Data.summary.platformEarnings || 0),
          })
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('AdminDashboard finance fetch error:', e)
      }
    }

    fetchFinance()
  }, [authToken])

  const formatted = useMemo(() => {
    const formatCurrency = (value) =>
      `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

    return {
      revenueThisMonth: formatCurrency(financeSummaryLast30.totalRevenue),
      revenueAllTime: formatCurrency(financeSummaryAllTime.totalRevenue),
      platformThisMonth: formatCurrency(financeSummaryLast30.platformEarnings),
      platformAllTime: formatCurrency(financeSummaryAllTime.platformEarnings),
    }
  }, [financeSummaryAllTime, financeSummaryLast30])

  return (
    <div className="space-y-8">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Executive Overview</h1>
          <p className="mt-1 text-sm text-slate-500">
            Enterprise performance real-time command center.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
        >
          <ArrowUpRight className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Stat cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <AdminStatCard
          title="Total Revenue"
          value={formatted.revenueThisMonth}
          subtitle={`This month · All time ${formatted.revenueAllTime}`}
          icon={ArrowUpRight}
          badge={{ label: '+12.5%', variant: 'success' }}
        />
        <AdminStatCard
          title="Platform Fee"
          value={formatted.platformThisMonth}
          subtitle={`This month · All time ${formatted.platformAllTime}`}
          icon={DollarSign}
          badge={{ label: 'Finance', variant: 'default' }}
        />
        <AdminStatCard
          title="Active Users"
          value="8,241"
          subtitle="Daily active users · 2.1k"
          icon={Users}
          badge={{ label: '+5.2%', variant: 'success' }}
        />
        <AdminStatCard
          title="Pending Bookings"
          value="42"
          subtitle="9 overdue by 24h+"
          icon={Clock}
          badge={{ label: 'Update', variant: 'default' }}
        />
        <AdminStatCard
          title="New Disputes"
          value="5"
          subtitle="Resolution time avg. 4h"
          icon={AlertTriangle}
          badge={{ label: 'High Priority', variant: 'danger' }}
        />
      </section>

      {/* Charts row */}
      <section className="grid grid-cols-1 2xl:grid-cols-2 gap-5">
        <div className="min-h-[280px]">
          <RevenueGrowthChart />
        </div>
        <div className="min-h-[280px]">
          <BookingDistributionChart />
        </div>
      </section>
    </div>
  )
}

export default AdminDashboard

