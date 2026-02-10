import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchBarberEarnings } from '../api/barberEarnings'
import { Download, ArrowLeft, ArrowRight } from 'lucide-react'

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
const TRANSACTIONS_PER_PAGE = 10

const BarberEarnings = () => {
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState('This Week')
  const [currentPage, setCurrentPage] = useState(1)
  const [autoPayout, setAutoPayout] = useState(true)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const loadEarnings = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetchBarberEarnings(token)
      if (res.success && res.data) {
        setData(res.data)
      } else {
        setData(null)
      }
    } catch (err) {
      setError(err.message || 'Failed to load earnings')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadEarnings()
  }, [loadEarnings])

  const availableBalance = data?.availableBalance ?? 0
  const totalEarnedThisMonth = data?.totalEarnedThisMonth ?? 0
  const monthName = data?.monthName ?? '—'
  const projectedEndOfMonth = data?.projectedEndOfMonth ?? 0
  const avgPerService = data?.avgPerService ?? 0
  const weeklyPerformance = data?.weeklyPerformance ?? [0, 0, 0, 0, 0, 0, 0]
  const transactions = data?.transactions ?? []
  const totalTransactions = data?.totalTransactions ?? 0

  const maxWeek = Math.max(1, ...weeklyPerformance)
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * TRANSACTIONS_PER_PAGE,
    currentPage * TRANSACTIONS_PER_PAGE
  )
  const totalPages = Math.max(1, Math.ceil(transactions.length / TRANSACTIONS_PER_PAGE))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <p className="text-gray-600">Loading earnings...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Earnings</h1>
          <p className="text-gray-600">Track your revenue and manage payouts</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    )
  }

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
              <p className="text-5xl font-bold text-gray-800 mb-2">
                ₹{Number(availableBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-green-600">
                {totalEarnedThisMonth > 0 ? `${monthName} earnings included` : 'No earnings yet'}
              </p>
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
                  autoPayout ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-600'
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
            <p className="text-xs text-gray-500 uppercase mb-2">Total Earned ({monthName})</p>
            <p className="text-3xl font-bold text-gray-800">
              ₹{Number(totalEarnedThisMonth ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-xs text-gray-500 uppercase mb-2">Projected End of Month</p>
            <p className="text-3xl font-bold text-gray-800">
              ₹{Number(projectedEndOfMonth ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-xs text-gray-500 uppercase mb-2">Avg. Per Service</p>
            <p className="text-3xl font-bold text-gray-800">
              ₹{Number(avgPerService ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
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
                    activeTab === tab ? 'bg-gray-200 text-gray-800' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-end justify-between gap-2 px-4 py-4 mb-4">
            {weeklyPerformance.map((value, index) => (
              <div
                key={index}
                className="flex-1 h-full flex flex-col justify-end items-center"
                title={`₹${Number(value ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              >
                <div
                  className="w-full bg-teal-mint rounded-t transition-all"
                  style={{
                    height: maxWeek > 0 ? `${Math.max(2, (value / maxWeek) * 100)}%` : '2%',
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between px-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <span
                key={day}
                className={`text-xs font-medium ${day === 'Sat' ? 'text-teal-mint' : 'text-gray-500'}`}
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
                {paginatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 px-4 text-center text-gray-500 text-sm">
                      No transactions yet. Completed appointments will appear here.
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4 text-sm text-gray-700">{transaction.date}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={transaction.avatar || DEFAULT_AVATAR}
                            alt={transaction.customer}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="text-sm font-medium text-gray-800">{transaction.customer}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-700">{transaction.service}</td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-sm font-medium text-green-600">
                          +₹{Number(transaction.amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            String(transaction.status).toUpperCase() === 'COMPLETED' ||
                            String(transaction.status).toUpperCase() === 'CONFIRMED' ||
                            String(transaction.status).toUpperCase() === 'PAID'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {transactions.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {(currentPage - 1) * TRANSACTIONS_PER_PAGE + 1}–{Math.min(currentPage * TRANSACTIONS_PER_PAGE, transactions.length)} of {transactions.length} transactions
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
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
