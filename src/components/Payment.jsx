import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'



const Payment = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const {
    barber,
    selectedServices,
    totalPrice,
    selectedDate,
    selectedTime
  } = location.state || {}

  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [promoCode, setPromoCode] = useState('')

  const taxRate = 0.08
  const convenienceFee = 20

  const taxAmount = totalPrice ? totalPrice * taxRate : 0
  const finalAmount = totalPrice
    ? totalPrice + taxAmount + convenienceFee
    : 0


const storedUser = localStorage.getItem("user");
const user = storedUser ? JSON.parse(storedUser) : null;

const handleConfirmPay = async () => {

  // 🔒 STEP 2.1 – LOGIN CHECK (MOST IMPORTANT)
  if (!user) {
    alert("Please login to continue payment");
    navigate("/login");
    return;
  }

  // 🔒 STEP 2.2 – PAY ON SHOP (login required)
  if (paymentMethod === "payonshop") {
    navigate("/booking-confirmation");
    return;
  }

  // 🔒 STEP 2.3 – CREATE ORDER (TOKEN WITH REQUEST)
  const res = await fetch("http://localhost:5000/api/payment/create-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify({ amount: finalAmount })
  });

  const order = await res.json();

  // 🔒 STEP 2.4 – RAZORPAY OPTIONS (USER DATA)
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: "INR",
    name: "BarberPro",
    description: "Service Booking",
    order_id: order.id,

    handler: async function (response) {

      // 🔒 STEP 2.5 – VERIFY PAYMENT (TOKEN REQUIRED)
      const verifyRes = await fetch(
        "http://localhost:5000/api/payment/verify-payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify(response)
        }
      );

      const verifyData = await verifyRes.json();

      if (verifyData.success) {

        // 🔒 STEP 2.6 – CREATE APPOINTMENT AFTER PAYMENT
        await fetch("http://localhost:5000/api/appointment-payment/after-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            barberId: barber.id,
            appointmentDate: selectedDate,
            appointmentTime: selectedTime,
            serviceIds: selectedServices.map(s => s.id),
            razorpayPaymentId: response.razorpay_payment_id
          })
        });

        navigate("/booking-confirmation");

      } else {
        alert("Payment verification failed ❌");
      }
    },

    // 🔒 STEP 2.7 – PREFILL LOGGED-IN USER DATA
    prefill: {
      name: user.fullName,
      contact: user.mobileNumber
    },

    theme: { color: "#2dd4bf" }
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
};



if (!location.state) {
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600">
      No booking data found
    </div>
  )
}

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-mint flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-gray-800">BarberPro</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-700 hover:text-gray-900 text-sm">Home</a>
            <a href="#" className="text-gray-700 hover:text-gray-900 text-sm">My Bookings</a>
            <a href="#" className="text-gray-700 hover:text-gray-900 text-sm">Support</a>
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>
      </nav>

      {/* Progress Indicator */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-teal-mint font-medium">Service Selection</span>
            <span className="text-gray-400">→</span>
            <span className="text-teal-mint font-medium">Date & Time</span>
            <span className="text-gray-400">→</span>
            <span className="text-teal-mint font-medium">Payment</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex gap-8">
          {/* Left Column - Payment Method */}
          <div className="flex-1">
            {/* Payment Method Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Select Payment Method</h2>
              <p className="text-sm text-gray-500 mb-6">All transactions are secure and encrypted.</p>

              {/* UPI Option */}
              <div className="mb-4">
                <label className="flex items-start gap-4 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-teal-mint transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 w-5 h-5 text-teal-mint focus:ring-teal-mint"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">UPI (FASTEST)</span>
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">Google Pay, PhonePe, BHIM.</p>
                  </div>
                </label>
              </div>

              {/* Credit/Debit Card Option */}
              <div className="mb-4">
                <label className="flex items-start gap-4 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-teal-mint transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 w-5 h-5 text-teal-mint focus:ring-teal-mint"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">Credit / Debit Card</span>
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">Visa, Mastercard, RuPay, and more.</p>
                  </div>
                </label>
              </div>

              {/* Net Banking Option */}
              <div className="mb-4">
                <label className="flex items-start gap-4 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-teal-mint transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="netbanking"
                    checked={paymentMethod === 'netbanking'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 w-5 h-5 text-teal-mint focus:ring-teal-mint"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">Net Banking</span>
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">Select from 50+ banks.</p>
                  </div>
                </label>
              </div>

              {/* Pay on Shop Option */}
              <div>
                <label className="flex items-start gap-4 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-teal-mint transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="payonshop"
                    checked={paymentMethod === 'payonshop'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 w-5 h-5 text-teal-mint focus:ring-teal-mint"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">Pay on Shop</span>
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">Pay when you arrive at the shop.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Promo Code Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Have a Promo Code?</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter code"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-mint focus:border-transparent"
                />
                <button className="px-6 py-2 bg-teal-mint text-white rounded-lg hover:opacity-90 transition-opacity font-medium">
                  Apply
                </button>
              </div>
            </div>

            {/* Security Badges */}
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>PCI DSS Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Safe & Secure</span>
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="w-96 flex-shrink-0">
            <div className="space-y-6">
              {/* Appointment Detail */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">APPOINTMENT DETAIL</h3>
                <div className="flex items-start gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop"
                    alt="Marcus Henderson"
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{selectedServices?.[0]?.name}</h4>
                    <p className="text-sm text-gray-600 mb-1">by {barber?.fullName}</p>
                    <p className="text-sm text-gray-600">{selectedDate} • {selectedTime}</p>
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Summary</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Item Total</span>
                    <span className="text-gray-900">₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxes (8%)</span>
                    <span className="text-gray-900">₹{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-600">Convenience Fee</span>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-900">₹{convenienceFee}</span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">Total Amount</span>
                    <span className="text-2xl font-bold text-teal-mint">₹{finalAmount.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-green-600 text-right">SAVED $0.00 WITH PROMO</p>
                </div>
              </div>

              {/* Confirm & Pay Button */}
              <button
                onClick={handleConfirmPay}
                disabled={!user}
                className="w-full px-6 py-3 bg-teal-mint text-white rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center justify-center gap-2"
              >
                Confirm & Pay
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <p className="text-xs text-gray-500 text-center">
                By clicking 'Confirm & Pay', you agree to our Terms of Service and Cancellation Policy.
              </p>

              {/* Help Box */}
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-teal-mint flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Need help with payment?</p>
                  <a href="#" className="text-sm text-teal-mint hover:underline">Chat with our 24/7 support</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              © 2023 Groom & Co. Marketplace. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-xs text-gray-600 hover:text-gray-900">Privacy Policy</a>
              <a href="#" className="text-xs text-gray-600 hover:text-gray-900">Refund Policy</a>
              <a href="#" className="text-xs text-gray-600 hover:text-gray-900">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Payment
