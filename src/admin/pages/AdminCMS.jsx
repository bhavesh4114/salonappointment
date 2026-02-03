import React from 'react'

const AdminCMS = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">CMS</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage content blocks, landing pages, and marketplace messaging.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-slate-100/80 p-6">
        <p className="text-sm text-slate-500">
          Content management tools and page builders will be surfaced here. For now this static page
          ensures routes and layout behave like a production admin panel.
        </p>
      </div>
    </div>
  )
}

export default AdminCMS

