import React, { useState } from 'react'
import { Download, ArrowLeft, ArrowRight } from 'lucide-react'

const BarberEarnings = () => {
  const [activeTab, setActiveTab] = useState('This Week')
  const [currentPage, setCurrentPage] = useState(1)
  const [autoPayout, setAutoPayout] = useState(true)

  // Mock transaction data
  const transactions = [
    {
      id: 1,
      date: 'Oct 24, 2023',
      customer: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      service: 'Skin Fade + Beard Trim',
      amount: 45.00,
      status: 'COMPLETED'
    },
    {
      id: 2,
      date: 'Oct 24, 2023',
      customer: 'Marcus Thorne',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      service: 'Classic Haircut',
      amount: 35.00,
      status: 'COMPLETED'
    },
    {
      id: 3,
      date: 'Oct 23, 2023',
      customer: 'Jordan Lee',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
      service: 'Deluxe Grooming Package',
      amount: 85.00,
      status: 'COMPLETED'
    },
    {
      id: 4,
      date: 'Oct 23, 2023',
      customer: 'Sam Houston',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      service: 'Buzz Cut',
      amount: 25.00,
      status: 'PENDING'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Earnings</h1>
            <p className="text-gray-600">Track your revenue and manage payouts</p>
          </div>

          {/* Available Balance Card */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase mb-2">Available Balance</p>
                <p className="text-5xl font-bold text-gray-800 mb-2">$2,450.00</p>
                <p className="text-sm text-green-600">+12% this week</p>
              </div>
              <div className="flex items-center gap-4">
                <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Withdraw Funds
                </button>
                <button
                  onClick={() => setAutoPayout(!autoPayout)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    autoPayout
                      ? 'bg-gray-200 text-gray-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Auto-payout {autoPayout ? 'On' : 'Off'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-xs text-gray-500 uppercase mb-2">Total Earned (Oct)</p>
              <p className="text-3xl font-bold text-gray-800">$8,124.00</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-xs text-gray-500 uppercase mb-2">Projected End of Month</p>
              <p className="text-3xl font-bold text-gray-800">$10,400.00</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-xs text-gray-500 uppercase mb-2">Avg. Per Service</p>
              <p className="text-3xl font-bold text-gray-800">$42.50</p>
            </div>
          </div>

          {/* Weekly Performance Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Weekly Performance</h2>
              <div className="flex gap-2">
                {['This Week', 'This Month', 'Custom'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-gray-200 text-gray-800'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            {/* Chart Placeholder */}
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
              <p className="text-gray-400">Chart placeholder</p>
            </div>
            {/* Day Labels */}
            <div className="flex justify-between px-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <span
                  key={day}
                  className={`text-xs font-medium ${
                    day === 'Sat' ? 'text-teal-mint' : 'text-gray-500'
                  }`}
                >
                  {day}
                </span>
              ))}
            </div>
          </div>

          {/* Transaction History Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Transaction History</h2>
              <button className="text-green-600 hover:text-green-700 font-medium flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Customer</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Service</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-sm text-gray-700">{transaction.date}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={transaction.avatar}
                            alt={transaction.customer}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="text-sm font-medium text-gray-800">{transaction.customer}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-700">{transaction.service}</td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-sm font-medium text-green-600">+${transaction.amount.toFixed(2)}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            transaction.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">Showing 4 of 128 transactions</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              © 2023 BarberDash Financial Services. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-xs text-gray-500 hover:text-gray-700">Tax Documents</a>
              <a href="#" className="text-xs text-gray-500 hover:text-gray-700">Payout Policies</a>
              <a href="#" className="text-xs text-gray-500 hover:text-gray-700">Help Center</a>
            </div>
          </div>
        </div>
      </div>

  )
}

export default BarberEarnings
