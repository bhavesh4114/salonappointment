import React from 'react'

const AdminStatCard = ({ title, value, subtitle, icon: Icon, badge }) => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-100/80 px-6 py-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-teal-50 text-teal-600">
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        {badge && (
          <span
            className={[
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
              badge.variant === 'danger'
                ? 'bg-rose-50 text-rose-600'
                : badge.variant === 'success'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-slate-100 text-slate-600',
            ].join(' ')}
          >
            {badge.label}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
    </div>
  )
}

export default AdminStatCard

