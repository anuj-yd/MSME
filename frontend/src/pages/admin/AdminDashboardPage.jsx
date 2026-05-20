import { useEffect, useMemo, useState } from 'react'
import { SectionCard, StatCard } from '../dashboard/DashboardComponents.jsx'
import { AdminLayout } from './AdminLayout.jsx'
import { useAppActions } from '../../state/appStore.jsx'
import { normalizeStatus } from '../../lib/applicationRecords.js'

const STATUS_ORDER = [
  'draft',
  'submitted',
  'otp_required',
  'in_review',
  'approved',
  'filed',
  'completed',
  'rejected',
]

function AdminDashboardPage() {
  const { adminGetStats } = useAppActions()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function load() {
      setError('')
      setLoading(true)
      try {
        const data = await adminGetStats()
        if (mounted) setStats(data)
      } catch (e) {
        if (mounted) setError(e?.response?.data?.message || e.message || 'Failed to load dashboard stats')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [adminGetStats])

  const statusRows = useMemo(() => {
    const counts = stats?.applications_by_status || {}
    return STATUS_ORDER.map((status) => ({
      status,
      label: normalizeStatus(status),
      count: Number(counts[status] || 0),
    }))
  }, [stats])

  const actionCards = [
    {
      title: 'Review Applications',
      description: 'Open submitted cases, verify documents, request OTPs, and update filing status.',
      href: '#/admin/renewals',
    },
    {
      title: 'Manage Users',
      description: 'View registered users and confirm role assignments for platform access.',
      href: '#/admin/users',
    },
  ]

  return (
    <AdminLayout title="Admin Dashboard" subtitle="Applications, users, and filing status overview">
      {error ? (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total Users"
          value={loading ? '...' : `${stats?.total_users || 0}`}
          hint="Registered accounts"
          tone="primary"
        />
        <StatCard
          label="Premium Users"
          value={loading ? '...' : `${stats?.premium_users || 0}`}
          hint="Active entitlements"
        />
        <StatCard
          label="Applications"
          value={loading ? '...' : `${stats?.total_applications || 0}`}
          hint="All renewal cases"
          tone="warn"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="Application Status" description="Current case distribution across the renewal workflow.">
            {loading ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-4 text-sm text-slate-300">
                Loading dashboard...
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-800">
                <div className="divide-y divide-slate-800">
                  {statusRows.map((row) => (
                    <div key={row.status} className="flex items-center justify-between gap-4 bg-slate-950/40 px-4 py-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-100">{row.label}</div>
                        <div className="mt-0.5 text-xs text-slate-500">{row.status}</div>
                      </div>
                      <div className="text-2xl font-black text-white">{row.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard title="Shortcuts" description="Jump to the admin work areas.">
          <div className="space-y-3">
            {actionCards.map((card) => (
              <a
                key={card.href}
                href={card.href}
                className="block rounded-2xl border border-slate-800 bg-slate-950/50 p-4 transition-colors hover:bg-slate-900"
              >
                <div className="text-sm font-bold text-slate-100">{card.title}</div>
                <div className="mt-1 text-xs leading-5 text-slate-400">{card.description}</div>
              </a>
            ))}
          </div>
        </SectionCard>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboardPage
