import React from 'react'
import { Users, UserCheck, AlertOctagon, Search, ChevronLeft, ChevronRight } from 'lucide-react'

const barbers = [
  {
    id: 1,
    name: 'Alex Rivera',
    email: 'alex@example.com',
    shop: 'The Fade Shop',
    status: 'Active',
    joined: 'Oct 12, 2023',
  },
  {
    id: 2,
    name: 'Jordan Smith',
    email: 'jordan@pro.com',
    shop: 'Classic Cuts',
    status: 'Active',
    joined: 'Nov 05, 2023',
  },
  {
    id: 3,
    name: 'Sam Wilson',
    email: 'sam@cuts.com',
    shop: 'Urban Styles',
    status: 'Suspended',
    joined: 'Dec 01, 2023',
  },
  {
    id: 4,
    name: 'Casey Jones',
    email: 'casey@barber.com',
    shop: 'Elite Barbers',
    status: 'Active',
    joined: 'Jan 15, 2024',
  },
]

const statusBadgeClass = (status) => {
  const s = status.toLowerCase()
  if (s === 'active') return 'bg-emerald-50 text-emerald-600'
  if (s === 'suspended') return 'bg-rose-50 text-rose-600'
  return 'bg-slate-100 text-slate-600'
}

const AdminBarbers = () => {
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
            <p className="text-2xl font-semibold text-slate-900">420</p>
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
            <p className="text-2xl font-semibold text-slate-900">385</p>
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
            <p className="text-2xl font-semibold text-slate-900">35</p>
            <p className="text-[11px] text-rose-600 font-medium">Requires attention</p>
          </div>
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-rose-50 text-rose-600">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* Search + status filter */}
      <section className="bg-white rounded-xl shadow-md border border-slate-100/80 px-5 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:flex-1">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="search"
              placeholder="Search barbers by name, email or shop name..."
              className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

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
                  Account Status
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
              {barbers.map((b) => (
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
                        {b.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900">{b.name}</span>
                        <span className="text-xs text-slate-500">{b.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle text-sm text-slate-700">{b.shop}</td>
                  <td className="px-4 py-3 align-middle">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusBadgeClass(
                        b.status,
                      )}`}
                    >
                      {b.status === 'Active' && (
                        <span className="mr-1 inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                      {b.status === 'Suspended' && (
                        <span className="mr-1 inline-block w-1.5 h-1.5 rounded-full bg-rose-500" />
                      )}
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle text-sm text-slate-700">{b.joined}</td>
                  <td className="px-4 py-3 align-middle text-right">
                    <div className="inline-flex items-center gap-3 text-xs">
                      <button type="button" className="text-teal-600 hover:underline">
                        View
                      </button>
                      <button type="button" className="text-slate-500 hover:underline">
                        Edit
                      </button>
                      {b.status === 'Suspended' ? (
                        <button type="button" className="text-teal-600 hover:underline">
                          Activate
                        </button>
                      ) : (
                        <button type="button" className="text-rose-500 hover:underline">
                          Suspend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/60">
          <p className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-700">1</span> to{' '}
            <span className="font-semibold text-slate-700">10</span> of{' '}
            <span className="font-semibold text-slate-700">420</span> barbers
          </p>

          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-xs text-slate-600 hover:bg-slate-100"
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
            <span className="px-1 text-xs text-slate-400">…</span>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-xs text-slate-600 hover:bg-slate-100"
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

