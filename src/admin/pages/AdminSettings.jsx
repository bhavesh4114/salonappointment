import React, { useState } from 'react'
import {
  Settings,
  Lock,
  CreditCard,
  Bell,
  Box,
} from 'lucide-react'

const AdminSettings = () => {
  const [twoFa, setTwoFa] = useState(true)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [systemLogs, setSystemLogs] = useState(true)

  const Toggle = ({ checked, onChange }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 ${
        checked ? 'bg-teal-500' : 'bg-slate-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
        style={{ marginTop: 2 }}
      />
    </button>
  )

  const CardTitle = ({ icon: Icon, children }) => (
    <div className="flex items-center gap-2 mb-4">
      <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-teal-50 text-teal-600">
        <Icon className="w-4 h-4" />
      </div>
      <h2 className="text-sm font-semibold text-slate-900">{children}</h2>
    </div>
  )

  const Label = ({ children, htmlFor }) => (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-medium text-slate-600 mb-1.5"
    >
      {children}
    </label>
  )

  const inputClass =
    'w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent'

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage platform configuration, security, and preferences
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-teal-500 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
        >
          Save All Changes
        </button>
      </div>

      {/* Settings cards grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* General Settings */}
        <section className="bg-white rounded-xl shadow-md border border-slate-100/80 p-6">
          <CardTitle icon={Settings}>General Settings</CardTitle>
          <div className="space-y-4">
            <div>
              <Label htmlFor="platform-name">Platform Name</Label>
              <input
                id="platform-name"
                type="text"
                defaultValue="BarberMarket"
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="support-email">Support Email</Label>
              <input
                id="support-email"
                type="email"
                defaultValue="admin@barbermarket.com"
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <select id="currency" className={inputClass}>
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <select id="timezone" className={inputClass}>
                <option>UTC-5 (EST)</option>
                <option>UTC (GMT)</option>
                <option>UTC+1 (CET)</option>
              </select>
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              className="inline-flex items-center rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
            >
              Save Changes
            </button>
          </div>
        </section>

        {/* Security */}
        <section className="bg-white rounded-xl shadow-md border border-slate-100/80 p-6">
          <CardTitle icon={Lock}>Security</CardTitle>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Two-Factor Authentication (2FA)
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Required for all administrative accounts
                </p>
              </div>
              <Toggle checked={twoFa} onChange={setTwoFa} />
            </div>
            <div>
              <Label htmlFor="password-expiry">Password Expiry</Label>
              <select id="password-expiry" className={inputClass}>
                <option>90 Days</option>
                <option>60 Days</option>
                <option>30 Days</option>
                <option>Never</option>
              </select>
            </div>
            <div>
              <Label htmlFor="max-login">Max Login Attempts</Label>
              <input
                id="max-login"
                type="number"
                defaultValue="5"
                min="3"
                max="10"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Payment Settings */}
        <section className="bg-white rounded-xl shadow-md border border-slate-100/80 p-6">
          <CardTitle icon={CreditCard}>Payment Settings</CardTitle>
          <div className="space-y-4">
            <div>
              <Label htmlFor="commission">Platform Commission (%)</Label>
              <input
                id="commission"
                type="number"
                defaultValue="15"
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="min-payout">Minimum Payout Amount</Label>
              <input
                id="min-payout"
                type="text"
                defaultValue="$ 50"
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="payout-schedule">Payout Schedule</Label>
              <select id="payout-schedule" className={inputClass}>
                <option>Weekly (Mondays)</option>
                <option>Bi-weekly</option>
                <option>Monthly</option>
              </select>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-white rounded-xl shadow-md border border-slate-100/80 p-6">
          <CardTitle icon={Bell}>Notifications</CardTitle>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-slate-900">Email Alerts</p>
              <Toggle checked={emailAlerts} onChange={setEmailAlerts} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-slate-900">
                SMS Notifications
              </p>
              <Toggle checked={smsNotifications} onChange={setSmsNotifications} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-slate-900">
                Push Notifications
              </p>
              <Toggle
                checked={pushNotifications}
                onChange={setPushNotifications}
              />
            </div>
          </div>
        </section>
      </div>

      {/* System card - full width */}
      <section className="bg-white rounded-xl shadow-md border border-slate-100/80 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <CardTitle icon={Box}>System</CardTitle>
          <p className="text-xs text-slate-500 shrink-0">
            Last Updated Oct 24, 2023 14:32:01
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-900">
                Maintenance Mode
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Take the marketplace offline for scheduled updates.
              </p>
            </div>
            <Toggle checked={maintenanceMode} onChange={setMaintenanceMode} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-900">
                Detailed System Logs
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Log all API calls and technical events for auditing.
              </p>
            </div>
            <Toggle checked={systemLogs} onChange={setSystemLogs} />
          </div>
        </div>
      </section>

      {/* Bottom action */}
      <div className="flex justify-center">
        <button
          type="button"
          className="inline-flex items-center rounded-full bg-teal-500 px-8 py-3 text-sm font-medium text-white shadow-sm hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
        >
          Apply Global Settings
        </button>
      </div>
    </div>
  )
}

export default AdminSettings
