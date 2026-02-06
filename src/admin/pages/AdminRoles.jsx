import React, { useState, useEffect } from 'react'
import {
  Key,
  Pencil,
  Trash2,
  Shield,
  History,
  Lock,
  Check,
  Scissors,
  User,
  Headset,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const roles = [
  {
    id: 1,
    name: 'Admin',
    description: 'Full system access and platform-wide settings.',
    assignedUsers: 12,
    active: true,
    icon: Check,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    id: 2,
    name: 'Barber',
    description: 'Manage services, working hours, and profile...',
    assignedUsers: 0,
    active: true,
    icon: Scissors,
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
  },
  {
    id: 3,
    name: 'User',
    description: 'Standard customer access for booking and...',
    assignedUsers: 0,
    active: true,
    icon: User,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
  },
  {
    id: 4,
    name: 'Support',
    description: 'Can access customer data and resolve bookin...',
    assignedUsers: 24,
    active: false,
    icon: Headset,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
]

const insightCards = [
  {
    title: 'System Integrity',
    text: 'Automated permission audits every 24h',
    icon: Shield,
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
  },
  {
    title: 'Permission Logs',
    text: 'Last permission change: 2 hours ago by Alex.',
    icon: History,
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
  },
  {
    title: 'Security Compliance',
    text: 'Platform uses RBAC methodology.',
    icon: Lock,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
  },
]

const permissionCategories = [
  {
    title: 'User Management',
    permissions: [
      { id: 'view-users', label: 'View Users', helper: 'View user list and profiles' },
      { id: 'create-users', label: 'Create Users', helper: 'Add new user accounts' },
      { id: 'edit-users', label: 'Edit Users', helper: 'Update user details' },
      { id: 'delete-users', label: 'Delete Users', helper: 'Remove user accounts' },
    ],
  },
  {
    title: 'Barber Management',
    permissions: [
      { id: 'view-barbers', label: 'View Barbers', helper: 'View barber list and profiles' },
      { id: 'edit-barbers', label: 'Edit Barber Profiles', helper: 'Update barber details' },
      { id: 'suspend-barbers', label: 'Suspend / Activate Barbers', helper: 'Enable or disable barber accounts' },
    ],
  },
  {
    title: 'Services',
    permissions: [
      { id: 'view-services', label: 'View Services', helper: 'View service catalog' },
      { id: 'create-services', label: 'Create Services', helper: 'Add new services' },
      { id: 'edit-services', label: 'Edit Services', helper: 'Update service details' },
      { id: 'delete-services', label: 'Delete Services', helper: 'Remove services' },
    ],
  },
  {
    title: 'Bookings',
    permissions: [
      { id: 'view-bookings', label: 'View Bookings', helper: 'View all bookings' },
      { id: 'approve-bookings', label: 'Approve / Cancel Bookings', helper: 'Confirm or cancel appointments' },
    ],
  },
  {
    title: 'Finance & Reports',
    permissions: [
      { id: 'view-finance', label: 'View Finance', helper: 'Access finance dashboard' },
      { id: 'export-reports', label: 'Export Reports', helper: 'Download reports and exports' },
    ],
  },
]

const getDefaultPermissionChecks = (roleName) => {
  const allIds = permissionCategories.flatMap((c) => c.permissions.map((p) => p.id))
  const defaults = Object.fromEntries(allIds.map((id) => [id, false]))
  if (roleName === 'Admin') allIds.forEach((id) => { defaults[id] = true })
  else if (roleName === 'Barber') {
    ;['view-barbers', 'edit-barbers', 'view-services', 'edit-services', 'view-bookings'].forEach((id) => { defaults[id] = true })
  }
  else if (roleName === 'Support') {
    ;['view-users', 'view-barbers', 'view-bookings', 'approve-bookings'].forEach((id) => { defaults[id] = true })
  }
  else if (roleName === 'User') {
    ;['view-services', 'view-bookings'].forEach((id) => { defaults[id] = true })
  }
  return defaults
}

const buildRolePermissionMatrix = (roleName) => {
  // Base matrix shape
  const base = {
    services: { view: false, create: false, edit: false, delete: false },
    bookings: { view: false, create: false, edit: false, delete: false },
    profile: { view: false, create: false, edit: false, delete: false },
    earnings: { view: false, create: false, edit: false, delete: false }, // mainly for barbers
  }

  const role = roleName.toLowerCase()

  if (role === 'user') {
    // ✅ Allowed for Users
    base.services.view = true // View Services
    base.bookings.view = true // View Own Bookings
    base.bookings.create = true // Book Appointment
    base.bookings.delete = true // Cancel Own Booking
    base.profile.edit = true // Edit Own Profile

    // ❌ Not exposed at all here: delete users, manage services, manage barbers, admin dashboard
  } else if (role === 'barber') {
    // ✅ Allowed for Barbers
    base.bookings.view = true // View Appointments
    base.bookings.edit = true // Accept / Reject / Cancel Appointment (treated as edit/delete)
    base.bookings.delete = true

    base.services.view = true
    base.services.create = true
    base.services.edit = true
    base.services.delete = true // Manage Own Services (Add / Edit / Delete)

    base.profile.edit = true // Edit Own Profile

    base.earnings.view = true // View Earnings

    // ❌ Not exposed: delete users, access admin dashboard
  }

  return base
}

const AdminRoles = () => {
  const { token } = useAuth()

  const [permissionCounts, setPermissionCounts] = useState({ users: null, barbers: null })

  const visibleRoles = roles.filter(
    (role) => role.name !== 'Admin' && role.name !== 'Support'
  )

  const [toggles, setToggles] = useState(
    Object.fromEntries(visibleRoles.map((r) => [r.id, r.active]))
  )
  const [editingRole, setEditingRole] = useState(null)
  const [permissionChecks, setPermissionChecks] = useState({})
  const [permissionModalRole, setPermissionModalRole] = useState(null)
  const [rolePermissionMatrix, setRolePermissionMatrix] = useState({})
  const [savingRolePermissions, setSavingRolePermissions] = useState(false)

  useEffect(() => {
    const authToken =
      token ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null)
    if (!authToken) return

    const fetchCounts = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/permissions/stats`, {
          headers: { Authorization: `Bearer ${authToken}` },
        })
        const data = await res.json().catch(() => null)
        if (!res.ok || !data?.success || !data.data) return
        setPermissionCounts({
          users: typeof data.data.users === 'number' ? data.data.users : null,
          barbers: typeof data.data.barbers === 'number' ? data.data.barbers : null,
        })
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('AdminRoles permission counts error:', err)
      }
    }

    fetchCounts()
  }, [token])

  const currentPage = 1
  const totalResults = 6
  const pageSize = 4

  const handleToggle = (id) => {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const openEditModal = (role) => {
    setEditingRole(role)
    setPermissionChecks(getDefaultPermissionChecks(role.name))
  }

  const closeEditModal = () => {
    setEditingRole(null)
  }

  const setPermission = (id, checked) => {
    setPermissionChecks((prev) => ({ ...prev, [id]: checked }))
  }

  const handleSavePermissions = () => {
    closeEditModal()
  }

  const openPermissionModal = (role) => {
    setPermissionModalRole(role)
    setRolePermissionMatrix(buildRolePermissionMatrix(role.name))
  }

  const closePermissionModal = () => {
    if (savingRolePermissions) return
    setPermissionModalRole(null)
    setRolePermissionMatrix({})
  }

  const updateRolePermission = (moduleKey, actionKey, checked) => {
    setRolePermissionMatrix((prev) => ({
      ...prev,
      [moduleKey]: {
        ...(prev[moduleKey] || {}),
        [actionKey]: checked,
      },
    }))
  }

  const handleSaveRolePermissions = async () => {
    if (!permissionModalRole) return

    const authToken =
      token ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null)

    const payload = {
      role: permissionModalRole.name.toLowerCase(),
      permissions: rolePermissionMatrix,
    }

    setSavingRolePermissions(true)
    try {
      // Example API integration – backend must enforce that only admins can call this.
      const res = await fetch(
        `${API_BASE}/api/admin/permissions/${encodeURIComponent(payload.role)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify(payload),
        },
      )

      if (!res.ok) {
        const errBody = await res.json().catch(() => null)
        // eslint-disable-next-line no-console
        console.error('Save role permissions failed:', {
          status: res.status,
          statusText: res.statusText,
          body: errBody,
        })
        throw new Error(errBody?.message || 'Failed to save permissions')
      }

      // No UI change yet – this is a config screen only.
      closePermissionModal()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Save role permissions error:', err)
      // Optionally you could add a toast here.
    } finally {
      setSavingRolePermissions(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Permissions Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View and manage system permissions and access rights for Users and Barbers.
          </p>
        </div>
      </div>

      {/* Permissions table card */}
      <section className="bg-white rounded-xl shadow-md border border-slate-100/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Assigned Users
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleRoles.map((role) => {
                const Icon = role.icon
                const isOn = toggles[role.id]

                let assignedUsers = role.assignedUsers
                if (role.name === 'Barber' && permissionCounts.barbers != null) {
                  assignedUsers = permissionCounts.barbers
                } else if (role.name === 'User' && permissionCounts.users != null) {
                  assignedUsers = permissionCounts.users
                }

                return (
                  <tr
                    key={role.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-3">
                        <div
                          className={`inline-flex items-center justify-center w-9 h-9 rounded-full ${role.iconBg} ${role.iconColor}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-slate-900">
                          {role.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-slate-600">
                      {role.description}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {assignedUsers.toLocaleString()} Users
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isOn}
                          onClick={() => handleToggle(role.id)}
                          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-0 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 ${
                            isOn ? 'bg-teal-500' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
                              isOn ? 'translate-x-5' : 'translate-x-0.5'
                            }`}
                            style={{ marginTop: 2 }}
                          />
                        </button>
                        <span
                          className={`text-xs font-medium ${
                            isOn ? 'text-teal-600' : 'text-slate-500'
                          }`}
                        >
                          {isOn ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle text-right">
                      <div className="inline-flex items-center gap-1 justify-end">
                        <button
                          type="button"
                          onClick={() => openPermissionModal(role)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          title="Manage permissions"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(role)}
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
            <span className="font-semibold text-slate-700">{pageSize}</span> of{' '}
            <span className="font-semibold text-slate-700">{totalResults}</span>{' '}
            results
          </p>

          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="h-8 min-w-[2rem] px-2 rounded-full bg-teal-500 text-white text-xs font-semibold flex items-center justify-center"
            >
              1
            </button>
            <button
              type="button"
              className="h-8 min-w-[2rem] px-2 rounded-full border border-slate-200 text-xs text-slate-600 hover:bg-slate-100"
            >
              2
            </button>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Insight / info cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {insightCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow-md border border-slate-100/80 px-5 py-4 flex items-center gap-4"
            >
              <div
                className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${card.iconBg} ${card.iconColor}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  {card.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{card.text}</p>
              </div>
            </div>
          )
        })}
      </section>

      {/* Edit Permissions modal */}
      {editingRole && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={closeEditModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-permissions-title"
        >
          <div className="absolute inset-0 bg-black/50" aria-hidden />
          <div
            className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 shrink-0">
              <h2
                id="edit-permissions-title"
                className="text-lg font-semibold text-slate-900"
              >
                Edit Permissions
              </h2>
            </div>
            <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/60 shrink-0">
              <p className="text-sm font-medium text-slate-900">
                {editingRole.name}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage access rights for this role
              </p>
            </div>
            <div className="px-6 py-4 overflow-y-auto flex-1 min-h-0">
              <div className="space-y-5">
                {permissionCategories.map((category) => (
                  <div
                    key={category.title}
                    className="rounded-lg border border-slate-100 bg-slate-50/40 p-4"
                  >
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                      {category.title}
                    </h3>
                    <ul className="space-y-3">
                      {category.permissions.map((perm) => (
                        <li
                          key={perm.id}
                          className="flex items-start gap-3"
                        >
                          <input
                            type="checkbox"
                            id={`perm-${perm.id}`}
                            checked={permissionChecks[perm.id] ?? false}
                            onChange={(e) =>
                              setPermission(perm.id, e.target.checked)
                            }
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500"
                          />
                          <label
                            htmlFor={`perm-${perm.id}`}
                            className="flex-1 cursor-pointer"
                          >
                            <span className="text-sm font-medium text-slate-900">
                              {perm.label}
                            </span>
                            {perm.helper && (
                              <p className="text-xs text-slate-500 mt-0.5">
                                {perm.helper}
                              </p>
                            )}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={closeEditModal}
                className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                className="inline-flex items-center rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role-based Permission modal (opened from key icon) */}
      {permissionModalRole && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={closePermissionModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="role-permissions-title"
        >
          <div className="absolute inset-0 bg-black/50" aria-hidden />
          <div
            className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 shrink-0">
              <h2
                id="role-permissions-title"
                className="text-lg font-semibold text-slate-900"
              >
                Role Permissions
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {permissionModalRole.name} – configure what this role can view, create, edit, and delete.
              </p>
            </div>

            <div className="px-6 py-4 overflow-y-auto flex-1 min-h-0">
              <div className="space-y-5">
                {Object.entries(rolePermissionMatrix).map(([moduleKey, actions]) => {
                  // Hide empty modules with no true actions for cleaner UI
                  const hasAny = Object.values(actions || {}).some(Boolean)
                  if (!hasAny) return null

                  const title =
                    moduleKey === 'services'
                      ? 'Services'
                      : moduleKey === 'bookings'
                      ? 'Bookings / Appointments'
                      : moduleKey === 'profile'
                      ? 'Profile'
                      : moduleKey === 'earnings'
                      ? 'Earnings'
                      : moduleKey

                  return (
                    <div
                      key={moduleKey}
                      className="rounded-lg border border-slate-100 bg-slate-50/40 p-4"
                    >
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                        {title}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {['view', 'create', 'edit', 'delete'].map((actionKey) => {
                          const checked = !!actions[actionKey]
                          return (
                            <label
                              key={actionKey}
                              className="inline-flex items-center gap-2 text-xs text-slate-700"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) =>
                                  updateRolePermission(moduleKey, actionKey, e.target.checked)
                                }
                                className="h-4 w-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500"
                              />
                              <span className="capitalize">{actionKey}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={closePermissionModal}
                disabled={savingRolePermissions}
                className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRolePermissions}
                disabled={savingRolePermissions}
                className="inline-flex items-center rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 disabled:opacity-60"
              >
                {savingRolePermissions ? 'Saving…' : 'Save Permissions'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminRoles
