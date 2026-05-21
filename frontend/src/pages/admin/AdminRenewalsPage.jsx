import { useEffect, useMemo, useState } from 'react'
import { SectionCard, StatCard } from '../dashboard/DashboardComponents.jsx'
import { AdminLayout } from './AdminLayout.jsx'
import { useAppActions } from '../../state/appStore.jsx'
import { Pill } from '../renewals/RenewalComponents.jsx'
import { normalizeStatus } from '../../lib/applicationRecords.js'

const ADMIN_VISIBLE_STATUSES = new Set([
  'submitted',
  'payment_verified',
  'in_review',
  'approved',
  'filed',
  'completed',
  'rejected',
])

function AdminRenewalsPage() {
  const { adminListRenewals } = useAppActions()
  const [status, setStatus] = useState('submitted')
  const [apiItems, setApiItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    async function load() {
      setError('')
      setLoading(true)
      try {
        const res = await adminListRenewals('all')
        if (mounted) setApiItems(res.filter((item) => ADMIN_VISIBLE_STATUSES.has(item.status)))
      } catch (e) {
        setError(e?.response?.data?.message || e.message || 'Failed to load admin renewals')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [adminListRenewals])

  const items = apiItems
  const visibleItems = useMemo(
    () => status === 'all' ? items : items.filter((item) => item.status === status),
    [items, status],
  )

  const counts = useMemo(() => ({
    total: items.length,
    submitted: items.filter((item) => item.status === 'submitted').length,
    paymentVerified: items.filter((item) => item.status === 'payment_verified').length,
    approved: items.filter((item) => item.status === 'approved' || item.status === 'completed').length,
    review: items.filter((item) => item.status === 'in_review').length,
    rejected: items.filter((item) => item.status === 'rejected').length,
  }), [items])

  return (
    <AdminLayout title="Applications" subtitle="Review applications, approve filings, and issue certificates">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <StatCard label="Total" value={`${counts.total}`} hint="Loaded list" tone="primary" />
        <StatCard label="Submitted" value={`${counts.submitted}`} hint="Ready to review" />
        <StatCard label="Payment Verified" value={`${counts.paymentVerified}`} hint="Admin checked" />
        <StatCard label="In review" value={`${counts.review}`} hint="Being processed" />
        <StatCard label="Approved" value={`${counts.approved}`} hint="Approved or complete" />
        <StatCard label="Rejected" value={`${counts.rejected}`} hint="Sent back to user" tone="warn" />
      </div>

      <div className="mt-6">
        <SectionCard
          title="Applications"
          description="View user details, application details, documents, and payment status."
          actions={
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-200"
            >
              <option value="all">All</option>
              <option value="submitted">Submitted</option>
              <option value="payment_verified">Payment Verified</option>
              <option value="in_review">Under Process</option>
              <option value="approved">Approved</option>
              <option value="filed">Filed</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Certificate Ready</option>
            </select>
          }
        >
          {error ? (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-4 text-sm text-slate-300">
              Loading...
            </div>
          ) : visibleItems.length ? (
            <div className="overflow-hidden rounded-2xl border border-slate-800">
              <div className="hidden grid-cols-12 gap-3 border-b border-slate-800 bg-slate-950/70 px-4 py-3 text-xs font-semibold text-slate-400 md:grid">
                <div className="col-span-3">Enterprise/User</div>
                <div className="col-span-4">Application</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Submitted</div>
                <div className="col-span-1 text-right">Open</div>
              </div>
              <div className="divide-y divide-slate-800">
                {visibleItems.map((r) => (
                  <a
                    key={r.id}
                    href={`#/admin/renewals/${encodeURIComponent(r.id)}`}
                    className="grid gap-3 px-4 py-4 transition-colors hover:bg-slate-900/60 md:grid-cols-12"
                  >
                    <div className="min-w-0 md:col-span-3">
                      <div className="truncate text-sm font-semibold text-slate-100">{r.user?.name || '-'}</div>
                      <div className="mt-0.5 truncate text-xs text-slate-400">{r.user?.email || '-'}</div>
                    </div>
                    <div className="min-w-0 md:col-span-4">
                      <div className="truncate text-sm font-semibold text-slate-100">{r.renewal_type_name}</div>
                      <div className="mt-0.5 truncate text-xs text-slate-400">{r.renewal_type_code}</div>
                    </div>
                    <div className="flex items-center md:col-span-2">
                      <Pill tone={r.status === 'rejected' ? 'warn' : r.status === 'approved' || r.status === 'completed' ? 'ok' : 'info'}>
                        {normalizeStatus(r.status)}
                      </Pill>
                    </div>
                    <div className="flex items-center text-xs text-slate-400 md:col-span-2">
                      {r.submitted_at ? new Date(r.submitted_at).toLocaleString() : '-'}
                    </div>
                    <div className="flex items-center text-sm font-semibold text-primary-300 md:col-span-1 md:justify-end">
                      View
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-6 text-center text-sm text-slate-300">
              No cases in this filter.
            </div>
          )}
        </SectionCard>
      </div>
    </AdminLayout>
  )
}

export default AdminRenewalsPage
