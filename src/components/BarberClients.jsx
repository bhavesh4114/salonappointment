import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Calendar
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useBarberProfile } from '../hooks/useBarberProfile'
import { fetchBarberClients } from '../api/barberClients'
import ClientProfileModal from './ClientProfileModal'

const ITEMS_PER_PAGE = 10

function getClientTag(totalVisits) {
  if (totalVisits >= 5) return { label: 'VIP', statusColor: 'bg-orange-100 text-orange-700' }
  if (totalVisits >= 2) return { label: 'RETURNING', statusColor: 'bg-green-100 text-green-700' }
  return { label: 'NEW', statusColor: 'bg-blue-100 text-blue-700' }
}

function formatLastVisit(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const BarberClients = () => {
  const navigate = useNavigate()
  const { token } = useAuth()
  const { barberProfile } = useBarberProfile()

  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [filter, setFilter] = useState('All Clients')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedClient, setSelectedClient] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [clients, setClients] = useState([])
  const [totalClients, setTotalClients] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadClients = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetchBarberClients(
        {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: searchQuery.trim() || undefined,
        },
        token
      )
      if (res.success && res.data) {
        setClients(res.data.clients || [])
        setTotalClients(res.data.totalClients ?? 0)
      } else {
        setClients([])
        setTotalClients(0)
      }
    } catch (err) {
      setError(err.message || 'Failed to load clients')
      setClients([])
      setTotalClients(0)
    } finally {
      setLoading(false)
    }
  }, [token, currentPage, searchQuery])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(searchInput)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const totalPages = Math.max(1, Math.ceil(totalClients / ITEMS_PER_PAGE))

  const displayClients = clients.map((c) => {
    const tag = getClientTag(c.totalVisits)
    return {
      id: c.userId,
      userId: c.userId,
      name: c.fullName,
      fullName: c.fullName,
      mobileNumber: c.mobileNumber,
      avatar: c.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      lastVisit: formatLastVisit(c.lastVisit),
      lastVisitRaw: c.lastVisit,
      visits: c.totalVisits,
      totalSpent: c.totalSpent,
      status: tag.label,
      statusColor: tag.statusColor,
    }
  })

  const handleViewProfile = (client) => {
    const forModal = {
      ...client,
      name: client.fullName || client.name,
    }
    setSelectedClient(forModal)
    setIsModalOpen(true)
  }

  const handleBookAgain = () => {
    if (barberProfile?.id) {
      navigate('/booking', { state: { barber: barberProfile } })
    } else {
      navigate('/booking')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Clients</h1>
          <p className="text-gray-600">
            Manage your customers and view their history
          </p>
        </div>

        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border rounded-lg focus:ring-2 focus:ring-teal-mint"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <span className="text-sm">{filter}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">All Customers</h2>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading clients...</div>
        ) : displayClients.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No clients yet. Clients will appear here once they have completed an appointment with you.
          </div>
        ) : (
          <>
            {displayClients.map((client) => (
              <div
                key={client.userId}
                className="flex justify-between items-center py-4 border-b last:border-0"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={client.avatar}
                    alt={client.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex gap-2 items-center">
                      <h3 className="font-semibold">{client.name}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${client.statusColor}`}
                      >
                        {client.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Last: {client.lastVisit} • {client.visits} Visits •{' '}
                      <span className="text-green-600 font-semibold">
                        ${Number(client.totalSpent || 0).toFixed(0)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleViewProfile(client)}
                    className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={handleBookAgain}
                    className="px-4 py-2 bg-teal-mint text-white rounded-lg flex items-center gap-2 text-sm"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Again
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-center gap-2 mt-6">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-2 border rounded-lg disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-full ${
                    currentPage === p ? 'bg-teal-mint text-white' : 'bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-2 border rounded-lg disabled:opacity-50"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      <ClientProfileModal
        isOpen={isModalOpen}
        client={selectedClient ? { ...selectedClient, name: selectedClient.fullName || selectedClient.name } : null}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedClient(null)
        }}
      />
    </div>
  )
}

export default BarberClients
