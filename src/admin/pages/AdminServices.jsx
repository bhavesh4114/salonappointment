import React, { useEffect, useState, useCallback } from 'react'
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
import { useAuth } from '../../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const statusBadgeClass = (status) => {
  const s = status.toLowerCase()
  if (s === 'active') return 'bg-emerald-50 text-emerald-600'
  return 'bg-slate-100 text-slate-600'
}

const AdminServices = () => {
  const { token } = useAuth()

  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  })

  const authToken =
    token ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null)

  const fetchServices = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', String(pagination.page))
      params.set('limit', String(pagination.limit))
      if (search.trim()) params.set('search', search.trim())
      if (categoryFilter) params.set('category', categoryFilter)
      if (statusFilter) params.set('status', statusFilter)

      if (priceRange) {
        if (priceRange === 'below-500') {
          params.set('maxPrice', '500')
        } else if (priceRange === '500-1000') {
          params.set('minPrice', '500')
          params.set('maxPrice', '1000')
        } else if (priceRange === 'above-1000') {
          params.set('minPrice', '1000')
        }
      }

      const res = await fetch(`${API_BASE}/api/admin/services?${params.toString()}`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      })

      let data
      try {
        data = await res.json()
      } catch {
        data = null
      }

      if (!res.ok || !data?.success) {
        console.error('AdminServices fetch error response:', {
          status: res.status,
          statusText: res.statusText,
          body: data,
        })
        const message =
          data?.message || `Failed to fetch services (${res.status} ${res.statusText})`
        throw new Error(message)
      }

      setServices(data.data || [])
      if (data.pagination) {
        setPagination((prev) => ({ ...prev, ...data.pagination }))
      } else if (typeof data.total === 'number') {
        setPagination((prev) => ({
          ...prev,
          total: data.total,
          totalPages: Math.ceil(data.total / prev.limit) || 1,
        }))
      }
    } catch (e) {
      console.error('AdminServices fetch error:', e)
      setError(e.message)
      setServices([])
    } finally {
      setLoading(false)
    }
  }, [authToken, pagination.page, pagination.limit, search, categoryFilter, statusFilter, priceRange])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const goToPage = (p) => {
    if (p < 1 || p > pagination.totalPages) return
    setPagination((prev) => ({ ...prev, page: p }))
  }

  const start = (pagination.page - 1) * pagination.limit + 1
  const end = Math.min(pagination.page * pagination.limit, pagination.total)

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setSearch(searchInput.trim())
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleClearFilters = () => {
    setSearchInput('')
    setSearch('')
    setCategoryFilter('')
    setStatusFilter('')
    setPriceRange('')
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

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

      {/* Search & filter */}
      <section className="bg-white rounded-xl shadow-md border border-slate-100/80 px-5 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-2 w-full md:flex-1">
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="search"
                placeholder="Search services by name, ID or category..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 self-start"
            >
              Clear
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <select
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent min-w-[120px]"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
            >
              <option value="">All Categories</option>
              <option value="HAIRCUT">Haircut</option>
              <option value="GROOMING">Grooming</option>
              <option value="CLASSIC">Classic</option>
              <option value="PREMIUM">Premium</option>
            </select>
            <select
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent min-w-[100px]"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent min-w-[110px]"
              value={priceRange}
              onChange={(e) => {
                setPriceRange(e.target.value)
                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
            >
              <option value="">Price Range</option>
              <option value="below-500">Under ₹500</option>
              <option value="500-1000">₹500 – ₹1000</option>
              <option value="above-1000">Above ₹1000</option>
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Loading services…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-rose-600">
                    {error}
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No services found.
                  </td>
                </tr>
              ) : (
                services.map((service) => {
                  const status = service.isActive ? 'Active' : 'Inactive'
                  const assignedCount = service.barber ? 1 : 0

                  return (
                    <tr
                      key={service.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-center gap-3">
                          <div
                            className="inline-flex items-center justify-center w-9 h-9 rounded-full shrink-0 bg-slate-100 text-slate-600"
                          >
                            <Scissors className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900">
                              {service.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle text-sm text-slate-700">
                        {service.category}
                      </td>
                      <td className="px-4 py-3 align-middle text-sm text-slate-700">
                        {service.duration} mins
                      </td>
                      <td className="px-4 py-3 align-middle text-sm font-semibold text-slate-900">
                        ₹{Number(service.price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusBadgeClass(
                            status,
                          )}`}
                        >
                          {status === 'Active' && (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          )}
                          {status === 'Inactive' && (
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          )}
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {assignedCount > 0 && (
                              <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-medium text-slate-600">
                                B
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-slate-500">
                            +{assignedCount}
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
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/60">
          <p className="text-xs text-slate-500">
            Showing{' '}
            <span className="font-semibold text-slate-700">
              {pagination.total ? start : 0}
            </span>
            –
            <span className="font-semibold text-slate-700">
              {end}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-slate-700">
              {pagination.total.toLocaleString()}
            </span>{' '}
            services
          </p>

          <div className="inline-flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="inline-flex h-8 min-w-[4rem] items-center justify-center rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="inline-flex h-8 min-w-[4rem] items-center justify-center rounded-lg bg-teal-500 px-3 text-xs font-medium text-white hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
