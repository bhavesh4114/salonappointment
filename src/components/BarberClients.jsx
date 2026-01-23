import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronDown, UserPlus, RotateCw, Star, ArrowLeft, ArrowRight, Users, Calendar } from 'lucide-react'
import ClientProfileModal from './ClientProfileModal'
import BarberSidebar from './BarberSidebar'

const BarberClients = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('All Clients')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedClient, setSelectedClient] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Mock client data
  const clients = [
    {
      id: 1,
      name: 'Alex Rivera',
      status: 'VIP',
      statusColor: 'bg-orange-100 text-orange-700',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      lastVisit: 'Oct 24, 2023',
      visits: 8,
      totalSpent: 450
    },
    {
      id: 2,
      name: 'Sarah Jenkins',
      status: 'RETURNING',
      statusColor: 'bg-green-100 text-green-700',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      lastVisit: 'Nov 02, 2023',
      visits: 3,
      totalSpent: 185
    },
    {
      id: 3,
      name: 'Marcus Stone',
      status: 'NEW',
      statusColor: 'bg-blue-100 text-blue-700',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      lastVisit: 'Nov 15, 2023',
      visits: 1,
      totalSpent: 60
    },
    {
      id: 4,
      name: 'Julian Chen',
      status: 'VIP',
      statusColor: 'bg-orange-100 text-orange-700',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      lastVisit: 'Oct 12, 2023',
      visits: 12,
      totalSpent: 720
    },
    {
      id: 5,
      name: 'Michael Torres',
      status: 'RETURNING',
      statusColor: 'bg-green-100 text-green-700',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      lastVisit: 'Nov 10, 2023',
      visits: 5,
      totalSpent: 320
    },
    {
      id: 6,
      name: 'Emma Wilson',
      status: 'NEW',
      statusColor: 'bg-blue-100 text-blue-700',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      lastVisit: 'Nov 18, 2023',
      visits: 1,
      totalSpent: 75
    },
    {
      id: 7,
      name: 'David Kim',
      status: 'VIP',
      statusColor: 'bg-orange-100 text-orange-700',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
      lastVisit: 'Oct 28, 2023',
      visits: 15,
      totalSpent: 980
    },
    {
      id: 8,
      name: 'Lisa Anderson',
      status: 'RETURNING',
      statusColor: 'bg-green-100 text-green-700',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
      lastVisit: 'Nov 05, 2023',
      visits: 4,
      totalSpent: 240
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <BarberSidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64">
        <div className="p-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Clients</h1>
                <p className="text-gray-600">Manage your customers and view their history</p>
              </div>
              <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent"
                  />
                </div>
                {/* Filter Dropdown */}
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-sm text-gray-700">{filter}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {/* Total Clients */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 uppercase mb-1">Total Clients</p>
              <p className="text-3xl font-bold text-gray-800 mb-1">128</p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span>↑</span>
                <span>+4% from last month</span>
              </p>
            </div>

            {/* New Clients */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 uppercase mb-1">New Clients</p>
              <p className="text-3xl font-bold text-gray-800 mb-1">12</p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span>↑</span>
                <span>+2 this week</span>
              </p>
            </div>

            {/* Returning */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <RotateCw className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 uppercase mb-1">Returning</p>
              <p className="text-3xl font-bold text-gray-800 mb-1">94</p>
              <p className="text-xs text-gray-600">73% retention rate</p>
            </div>

            {/* VIP Clients */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 uppercase mb-1">VIP Clients</p>
              <p className="text-3xl font-bold text-gray-800 mb-1">22</p>
              <p className="text-xs text-gray-600">Top 15% of revenue</p>
            </div>
          </div>

          {/* Client List Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">All Customers</h2>
              <p className="text-sm text-gray-500">Showing 128 clients</p>
            </div>

            {/* Client Cards */}
            <div className="space-y-4">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  {/* Left Side - Client Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <img
                      src={client.avatar}
                      alt={client.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-gray-800">{client.name}</h3>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${client.statusColor}`}>
                          {client.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Last: {client.lastVisit}</span>
                        <span>•</span>
                        <span>{client.visits} Visits</span>
                        <span>•</span>
                        <span className="text-green-600 font-semibold">${client.totalSpent} Total Spent</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Action Buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedClient(client)
                        setIsModalOpen(true)
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      View Profile
                    </button>
                    <button className="px-4 py-2 bg-teal-mint text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Book Again
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                disabled={currentPage === 1}
              >
                <ArrowLeft className="w-4 h-4 text-gray-600" />
              </button>
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-teal-mint text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(3, currentPage + 1))}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                disabled={currentPage === 3}
              >
                <ArrowRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Client Profile Modal */}
      <ClientProfileModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedClient(null)
        }}
        client={selectedClient}
      />
    </div>
  )
}

export default BarberClients
