import { PageShell } from '../dashboard/DashboardComponents.jsx'
import { useAppActions, useAppState } from '../../state/appStore.jsx'

export function AdminLayout({ title, subtitle, right, children }) {
  const { user } = useAppState()
  const { logout } = useAppActions()
  
  const nav = (
    <div className="flex items-center gap-2">
      <a
        href="#/admin/dashboard"
        className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
      >
        Dashboard
      </a>
      <a
        href="#/admin/renewals"
        className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
      >
        Renewals
      </a>
      <a
        href="#/admin/users"
        className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
      >
        Users
      </a>
      <div className="w-px h-5 bg-slate-300 mx-2"></div>
      <a
        href="#/"
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
      >
        Landing
      </a>
      <button
        onClick={async () => {
          await logout()
          window.location.hash = '#/admin/login'
        }}
        className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
      >
        Logout
      </button>
      {right}
    </div>
  )

  return (
    <PageShell
      title={title}
      subtitle={subtitle || `Signed in as ${user?.email || 'admin'}`}
      right={nav}
    >
      {children}
    </PageShell>
  )
}
