import React from 'react'
import {
  Users,
  UserCog,
  Scissors,
  UserCircle,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react'

const stats = [
  {
    label: 'Total Users',
    value: '1,284',
    delta: '+12%',
    icon: Users,
  },
  {
    label: 'Active Users',
    value: '1,150',
    delta: '+5%',
    icon: UserCog,
  },
  {
    label: 'Barbers',
    value: '420',
    delta: '+8%',
    icon: Scissors,
  },
  {
    label: 'Customers',
    value: '864',
    delta: '+15%',
    icon: UserCircle,
  },
]

const users = [
  {
    id: 1,
    name: 'Johnathan Doe',
    email: 'john.doe@example.com',
    role: 'Barber',
    status: 'Active',
    joined: 'Oct 12, 2023',
    lastActive: '2 hours ago',
  },
  {
    id: 2,
    name: 'Sarah Jenkins',
    email: 'sarah.j@outlook.com',
    role: 'Customer',
    status: 'Inactive',
    joined: 'Nov 03, 2023',
    lastActive: '3 days ago',
  },
  {
    id: 3,
    name: 'Marcus Vane',
    email: 'm.vane@gmail.com',
    role: 'Barber',
    status: 'Suspended',
    joined: 'Aug 22, 2023',
    lastActive: '1 month ago',
  },
  {
    id: 4,
    name: 'Elena Rodriguez',
    email: 'elena.rod@email.com',
    role: 'Customer',
    status: 'Active',
    joined: 'Jan 15, 2024',
    lastActive: 'Just now',
  },
]

const roleBadgeClass = (role) => {
  const r = role.toLowerCase()
  if (r === 'admin') return 'bg-teal-50 text-teal-700 border border-teal-100'
  if (r === 'barber') return 'bg-sky-50 text-sky-700 border border-sky-100'
  if (r === 'customer') return 'bg-violet-50 text-violet-700 border border-violet-100'
  return 'bg-slate-50 text-slate-700 border border-slate-100'
}

const statusBadgeClass = (status) => {
  const s = status.toLowerCase()
  if (s === 'active') return 'bg-emerald-50 text-emerald-600'
  if (s === 'inactive') return 'bg-slate-100 text-slate-600'
  if (s === 'suspended') return 'bg-rose-50 text-rose-600'
  return 'bg-slate-50 text-slate-600'
}

const AdminUsers = () => {
  return (
    <div className="space-y-7">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor accounts, manage roles, and track platform activity.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map(({ label, value, delta, icon: Icon }) => (
          <div
            key={label}
            className="bg-white rounded-xl shadow-md border border-slate-100/80 px-5 py-4 flex items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {label}
              </p>
              <p className="text-xl sm:text-2xl font-semibold text-slate-900">{value}</p>
              <p className="text-[11px] text-emerald-600 font-medium">{delta} vs last period</p>
            </div>
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-500">
              <Icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </section>

      {/* Search + filters */}
      <section className="bg-white rounded-xl shadow-md border border-slate-100/80 px-5 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:flex-1">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="search"
              placeholder="Search users by name, email or ID..."
              className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
            <option>Role: All</option>
            <option>Admin</option>
            <option>Barber</option>
            <option>Customer</option>
          </select>
          <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
            <option>Status: All</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Suspended</option>
          </select>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Users table */}
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
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Joined Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Last Active
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
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
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900">{user.name}</span>
                        <span className="text-xs text-slate-500">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${roleBadgeClass(user.role)}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBadgeClass(user.status)}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle text-sm text-slate-700">
                    {user.joined}
                  </td>
                  <td className="px-4 py-3 align-middle text-sm text-slate-700">
                    {user.lastActive}
                  </td>
                  <td className="px-4 py-3 align-middle text-right">
                    <div className="inline-flex items-center gap-1.5 text-slate-400">
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100 hover:text-slate-700"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100 hover:text-slate-700"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-rose-50 hover:text-rose-600"
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

        {/* Pagination footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/60">
          <p className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-700">1</span> to{' '}
            <span className="font-semibold text-slate-700">10</span> of{' '}
            <span className="font-semibold text-slate-700">1,284</span> users
          </p>

          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-100"
            >
              Prev
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
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-100"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AdminUsers

