import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  ChevronDown,
  UserPlus,
  RotateCw,
  Star,
  ArrowLeft,
  ArrowRight,
  Users,
  Calendar
} from 'lucide-react'
import ClientProfileModal from './ClientProfileModal'

const ITEMS_PER_PAGE = 4

const BarberClients = () => {
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('All Clients')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedClient, setSelectedClient] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Mock client data (later API mathi aavse)
  const clients = [
    {
      id: 1,
      name: 'Alex Rivera',
      status: 'VIP',
      statusColor: 'bg-orange-100 text-orange-700',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      lastVisit: 'Oct 24, 2023',
      visits: 8,
      totalSpent: 450
    },
    {
      id: 2,
      name: 'Sarah Jenkins',
      status: 'RETURNING',
      statusColor: 'bg-green-100 text-green-700',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      lastVisit: 'Nov 02, 2023',
      visits: 3,
      totalSpent: 185
    },
    {
      id: 3,
      name: 'Marcus Stone',
      status: 'NEW',
      statusColor: 'bg-blue-100 text-blue-700',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      lastVisit: 'Nov 15, 2023',
      visits: 1,
      totalSpent: 60
    },
    {
      id: 4,
      name: 'Julian Chen',
      status: 'VIP',
      statusColor: 'bg-orange-100 text-orange-700',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      lastVisit: 'Oct 12, 2023',
      visits: 12,
      totalSpent: 720
    },
    {
      id: 5,
      name: 'Michael Torres',
      status: 'RETURNING',
      statusColor: 'bg-green-100 text-green-700',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      lastVisit: 'Nov 10, 2023',
      visits: 5,
      totalSpent: 320
    },
    {
      id: 6,
      name: 'Emma Wilson',
      status: 'NEW',
      statusColor: 'bg-blue-100 text-blue-700',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      lastVisit: 'Nov 18, 2023',
      visits: 1,
      totalSpent: 75
    }
  ]

  // 🔍 Search Filter
  const filteredClients = useMemo(() => {
    return clients.filter(client =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery, clients])

  // 📄 Pagination
  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE)

  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredClients.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredClients, currentPage])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Clients</h1>
          <p className="text-gray-600">
            Manage your customers and view their history
          </p>
        </div>

        <div className="flex gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10 pr-4 py-2 w-64 border rounded-lg focus:ring-2 focus:ring-teal-mint"
            />
          </div>

          {/* Filter (future use) */}
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <span className="text-sm">{filter}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Client List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">All Customers</h2>

        {paginatedClients.map(client => (
          <div
            key={client.id}
            className="flex justify-between items-center py-4 border-b last:border-0"
          >
            <div className="flex items-center gap-4">
              <img
                src={client.avatar}
                alt={client.name}
                className="w-12 h-12 rounded-full"
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
                    ${client.totalSpent}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedClient(client)
                  setIsModalOpen(true)
                }}
                className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
              >
                View Profile
              </button>

              <button className="px-4 py-2 bg-teal-mint text-white rounded-lg flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4" />
                Book Again
              </button>
            </div>
          </div>
        ))}

        {/* Pagination */}
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="p-2 border rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-8 h-8 rounded-full ${
                currentPage === i + 1
                  ? 'bg-teal-mint text-white'
                  : 'bg-gray-100'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="p-2 border rounded-lg"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal */}
      <ClientProfileModal
        isOpen={isModalOpen}
        client={selectedClient}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedClient(null)
        }}
      />
    </div>
  )
}

export default BarberClients
