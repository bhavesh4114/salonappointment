import React from 'react'
import { X, Calendar, Edit, Check } from 'lucide-react'

const ClientProfileModal = ({ isOpen, onClose, client }) => {
  if (!client) return null

  const appointmentHistory = [
    {
      id: 1,
      service: 'Skin Fade & Beard Trim',
      date: 'Oct 12, 2023',
      price: 45.00
    },
    {
      id: 2,
      service: 'Classic Cut',
      date: 'Sep 05, 2023',
      price: 30.00
    },
    {
      id: 3,
      service: 'Luxury Shave Package',
      date: 'Aug 14, 2023',
      price: 65.00
    }
  ]

  const preferredServices = ['Skin Fade', 'Beard Trim', 'Hot Towel Shave']

  const barberNotes = "Prefers low fade, uses pomade. Sensitive skin on neck. Always enjoys a coffee during the service. Usually likes a 1.5 on the sides."

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Modal */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-800">Client Profile</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Client Info Section */}
          <div className="text-center mb-8">
            <img
              src={client.avatar}
              alt={client.name}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
            />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{client.name}</h3>
            <div className="inline-flex items-center gap-2 bg-teal-mint text-white px-3 py-1 rounded-full">
              <Check className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase">VIP CLIENT</span>
            </div>
          </div>

          {/* Preferred Services Section */}
          <div className="mb-8">
            <h4 className="text-sm font-bold text-gray-800 uppercase mb-4">Preferred Services</h4>
            <div className="flex flex-wrap gap-2">
              {preferredServices.map((service, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>

          {/* Appointment History Section */}
          <div className="mb-8">
            <h4 className="text-sm font-bold text-gray-800 uppercase mb-4">Appointment History</h4>
            <div className="space-y-4">
              {appointmentHistory.map((appointment) => (
                <div key={appointment.id} className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">{appointment.service}</p>
                    <p className="text-sm text-gray-500 mt-1">{appointment.date}</p>
                  </div>
                  <p className="text-gray-800 font-medium">${appointment.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Barber Notes Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-gray-800 uppercase">Barber Notes</h4>
              <Edit className="w-4 h-4 text-gray-400" />
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 leading-relaxed">{barberNotes}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ClientProfileModal
