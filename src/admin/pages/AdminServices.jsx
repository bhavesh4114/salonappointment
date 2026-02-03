import React from 'react'
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Scissors,
  Sparkles,
  CircleDot,
  Package,
} from 'lucide-react'

const statsCards = [
  {
    title: 'Premium Haircut',
    subtext: 'Most requested this month',
    badge: '+12%',
  },
  {
    title: '$42.50 Avg',
    subtext: 'Average ticket size',
    badge: '+5%',
  },
  {
    title: 'Shave & Beard',
    subtext: 'Fastest growing category',
    badge: '+8%',
  },
]

const services = [
  {
    id: 1,
    name: 'Premium Haircut',
    serviceId: 'SRV-001',
    category: 'Haircut',
    duration: '45 mins',
    price: '$35.00',
    status: 'Active',
    assignedCount: 22,
    icon: Scissors,
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
  },
  {
    id: 2,
    name: 'Beard Trim',
    serviceId: 'SRV-002',
    category: 'Grooming',
    duration: '30 mins',
    price: '$25.00',
    status: 'Active',
    assignedCount: 18,
    icon: Sparkles,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    id: 3,
    name: 'Classic Shave',
    serviceId: 'SRV-003',
    category: 'Classic',
    duration: '20 mins',
    price: '$20.00',
    status: 'Inactive',
    assignedCount: 12,
    icon: CircleDot,
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
  },
  {
    id: 4,
    name: 'Full Grooming Package',
    serviceId: 'SRV-004',
    category: 'Premium',
    duration: '90 mins',
    price: '$85.00',
    status: 'Active',
    assignedCount: 15,
    icon: Package,
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
  },
]

const statusBadgeClass = (status) => {
  const s = status.toLowerCase()
  if (s === 'active') return 'bg-emerald-50 text-emerald-600'
  return 'bg-slate-100 text-slate-600'
}

const AdminServices = () => {
  return (
    <div className="space-y-7">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Services Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Configure and manage the service catalog for all barbershop partners.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-teal-500 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
        >
          <Plus className="w-4 h-4" />
          Add New Service
        </button>
      </div>

      {/* Stats / insight cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {statsCards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl shadow-md border border-slate-100/80 px-5 py-4 relative"
          >
            <span className="absolute top-4 right-4 inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              {card.badge}
            </span>
            <div className="pr-12">
              <p className="text-lg font-semibold text-slate-900">{card.title}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mt-0.5">
                {card.subtext}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Search & filter */}
      <section className="bg-white rounded-xl shadow-md border border-slate-100/80 px-5 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
          <div className="flex flex-col gap-2 w-full md:flex-1">
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="search"
                placeholder="Search services by name, ID or category..."
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 self-start"
            >
              Clear
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent min-w-[120px]">
              <option>All Categories</option>
              <option>Haircut</option>
              <option>Grooming</option>
              <option>Classic</option>
              <option>Premium</option>
            </select>
            <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent min-w-[100px]">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent min-w-[110px]">
              <option>Price Range</option>
              <option>Under $25</option>
              <option>$25 – $50</option>
              <option>$50+</option>
            </select>
          </div>
        </div>
      </section>

      {/* Services table */}
      <section className="bg-white rounded-xl shadow-md border border-slate-100/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Service Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Duration
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Assigned Barbers
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => {
                const Icon = service.icon
                return (
                  <tr
                    key={service.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-3">
                        <div
                          className={`inline-flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${service.iconBg} ${service.iconColor}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900">
                            {service.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            ID: {service.serviceId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-slate-700">
                      {service.category}
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-slate-700">
                      {service.duration}
                    </td>
                    <td className="px-4 py-3 align-middle text-sm font-semibold text-slate-900">
                      {service.price}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusBadgeClass(
                          service.status,
                        )}`}
                      >
                        {service.status === 'Active' && (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        )}
                        {service.status === 'Inactive' && (
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        )}
                        {service.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-medium text-slate-600"
                            >
                              {String.fromCharCode(64 + i)}
                            </div>
                          ))}
                        </div>
                        <span className="text-xs text-slate-500">
                          +{service.assignedCount}
                        </span>
                      </div>
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
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/60">
          <p className="text-xs text-slate-500">
            Showing{' '}
            <span className="font-semibold text-slate-700">1</span>–
            <span className="font-semibold text-slate-700">4</span> of{' '}
            <span className="font-semibold text-slate-700">48</span> services
          </p>

          <div className="inline-flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-8 min-w-[4rem] items-center justify-center rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Previous
            </button>
            <button
              type="button"
              className="inline-flex h-8 min-w-[4rem] items-center justify-center rounded-lg bg-teal-500 px-3 text-xs font-medium text-white hover:bg-teal-600"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AdminServices
