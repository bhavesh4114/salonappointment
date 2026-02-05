import React from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

const data = [
  { month: 'JAN', revenue: 18, growth: 3.2 },
  { month: 'FEB', revenue: 21, growth: 4.1 },
  { month: 'MAR', revenue: 24, growth: 4.8 },
  { month: 'APR', revenue: 26, growth: 5.3 },
  { month: 'MAY', revenue: 29, growth: 5.9 },
  { month: 'JUN', revenue: 32, growth: 6.4 },
]

const RevenueGrowthChart = () => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-100/80 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Revenue vs Growth</h3>
          <p className="text-xs text-slate-500">Strategic correlation tracking (Last 6 months)</p>
        </div>
      </div>

      <div className="flex-1 min-h-[240px] mt-2 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
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
              tickFormatter={(v) => `${v}k`}
            />
            <Tooltip
              cursor={{ stroke: '#e2e8f0' }}
              contentStyle={{
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 30px rgba(148,163,184,0.25)',
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#14b8a6"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="growth"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default RevenueGrowthChart

