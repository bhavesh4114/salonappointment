import React from 'react'
import { ArrowUpRight, Users, Clock, AlertTriangle } from 'lucide-react'
import AdminStatCard from '../components/AdminStatCard'
import RevenueGrowthChart from '../components/charts/RevenueGrowthChart'
import BookingDistributionChart from '../components/charts/BookingDistributionChart'

const AdminDashboard = () => {
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
          value="$124,840"
          subtitle="+12.5% vs last month"
          icon={ArrowUpRight}
          badge={{ label: '+12.5%', variant: 'success' }}
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

