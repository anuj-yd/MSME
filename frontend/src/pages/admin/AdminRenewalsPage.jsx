import { useEffect, useMemo, useState } from 'react'
import { SectionCard, StatCard } from '../dashboard/DashboardComponents.jsx'
import { AdminLayout } from './AdminLayout.jsx'
import { useAppActions } from '../../state/appStore.jsx'
import { Pill } from '../renewals/RenewalComponents.jsx'
import { readApplicationRecords } from '../../lib/applicationRecords.js'

function AdminRenewalsPage() {
  const { adminListRenewals } = useAppActions()
  const [status, setStatus] = useState('all')
  const [apiItems, setApiItems] = useState([])
  const [localItems, setLocalItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    async function load() {
      setError('')
      setLoading(true)
      try {
        const res = await adminListRenewals('all')
        if (mounted) setApiItems(res)
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

  useEffect(() => {
    function syncLocalItems() {
      setLocalItems(readApplicationRecords())
    }

    syncLocalItems()
    window.addEventListener('application-records-change', syncLocalItems)
    return () => window.removeEventListener('application-records-change', syncLocalItems)
  }, [])

  const items = localItems.length ? localItems : apiItems
  const visibleItems = useMemo(
    () => status === 'all' ? items : items.filter((item) => item.status === status || item.status?.toLowerCase?.() === status),
    [items, status],
  )

  const counts = useMemo(() => ({
    total: items.length,
    submitted: items.filter((item) => item.status === 'Submitted' || item.status === 'submitted').length,
    payment: items.filter((item) => item.status === 'Payment Pending').length,
    review: items.filter((item) => item.status === 'Under Review' || item.status === 'in_review').length,
  }), [items])

  return (
    <AdminLayout title="Admin - Applications">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total" value={`${counts.total}`} hint="Loaded list" tone="primary" />
        <StatCard label="Submitted" value={`${counts.submitted}`} hint="Ready to review" />
        <StatCard label="Payment pending" value={`${counts.payment}`} hint="Waiting verification" tone="warn" />
        <StatCard label="In review" value={`${counts.review}`} hint="Being processed" />
      </div>

      <div className="mt-6">
        <SectionCard
          title="Applications"
          description="View user details, application details, documents, and payment status."
          actions={
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="Submitted">Submitted</option>
              <option value="Payment Pending">Payment Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Certificate Ready">Certificate Ready</option>
            </select>
          }
        >
          {error ? (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {loading && !localItems.length ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
              Loading...
            </div>
          ) : visibleItems.length ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-12 gap-3 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700">
                <div className="col-span-4">Enterprise/User</div>
                <div className="col-span-4">Application</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Updated</div>
              </div>
              <div className="divide-y divide-slate-200">
                {visibleItems.map((r) => (
                  <a
                    key={r.id}
                    href={`#/admin/renewals/${encodeURIComponent(r.id)}`}
                    className="grid grid-cols-12 gap-3 px-4 py-3 hover:bg-slate-50"
                  >
                    <div className="col-span-4 min-w-0">
                      <div className="truncate text-sm font-semibold">{r.businessName || r.user?.name || '-'}</div>
                      <div className="mt-0.5 truncate text-xs text-slate-600">{r.trackingId || r.user?.email || '-'}</div>
                    </div>
                    <div className="col-span-4 min-w-0">
                      <div className="truncate text-sm font-semibold">{r.renewalTypeName || r.renewal_type_name}</div>
                      <div className="mt-0.5 truncate text-xs text-slate-600">{r.registrationNumber || r.renewal_type_code}</div>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <Pill tone={r.status === 'Rejected' || r.status === 'Payment Pending' ? 'warn' : r.status === 'Certificate Ready' ? 'ok' : 'info'}>
                        {r.status}
                      </Pill>
                    </div>
                    <div className="col-span-2 flex items-center justify-end text-xs text-slate-600">
                      {r.updatedAt || r.updated_at ? new Date(r.updatedAt || r.updated_at).toLocaleString() : '-'}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-700">
              No cases in this filter.
            </div>
          )}
        </SectionCard>
      </div>
    </AdminLayout>
  )
}

export default AdminRenewalsPage
