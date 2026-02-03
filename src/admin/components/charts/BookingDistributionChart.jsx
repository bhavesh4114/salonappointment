import React from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const data = [
  { name: 'Fades & Cuts', value: 60, color: '#14b8a6', dotClass: 'bg-teal-500' },
  { name: 'Beard Trims', value: 25, color: '#38bdf8', dotClass: 'bg-sky-500' },
  { name: 'Full Styling', value: 15, color: '#f97316', dotClass: 'bg-orange-500' },
]

const BookingDistributionChart = () => {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-100/80 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Booking Distribution</h3>
          <p className="text-xs text-slate-500">By service category</p>
        </div>
      </div>

      <div className="flex-1 flex items-center gap-4 mt-2">
        <div className="relative flex-1 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={76}
                paddingAngle={3}
                stroke="#e2e8f0"
                strokeWidth={1}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total Svc</p>
            <p className="text-xl font-semibold text-slate-900">{total.toLocaleString()}k</p>
          </div>
        </div>

        <div className="w-1/2 space-y-3">
          <ul className="space-y-2">
            {data.map((item) => (
              <li key={item.name} className="flex items-center justify-between text-xs">
                <div className="inline-flex items-center gap-2">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${item.dotClass}`} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-900">{item.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default BookingDistributionChart

