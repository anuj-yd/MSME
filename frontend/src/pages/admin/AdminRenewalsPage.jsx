import { useEffect, useMemo, useState } from 'react'
import { PageShell, SectionCard, StatCard } from '../dashboard/DashboardComponents.jsx'
import { useAppActions, useAppState } from '../../state/appStore.jsx'
import { Pill } from '../renewals/RenewalComponents.jsx'

function AdminRenewalsPage() {
  const { user } = useAppState()
  const { adminListRenewals } = useAppActions()
  const [status, setStatus] = useState('submitted')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const counts = useMemo(() => {
    return {
      total: items.length,
      submitted: items.filter((x) => x.status === 'submitted').length,
      otp: items.filter((x) => x.status === 'otp_required').length,
      review: items.filter((x) => x.status === 'in_review').length,
    }
  }, [items])

  useEffect(() => {
    let mounted = true
    async function load() {
      setError('')
      setLoading(true)
      try {
        const res = await adminListRenewals(status)
        if (mounted) setItems(res)
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
  }, [adminListRenewals, status])

  return (
    <PageShell
      title="Admin • Renewals"
      subtitle={`Signed in as ${user?.email || 'admin'}`}
      right={
        <div className="flex items-center gap-2">
          <a
            href="#/dashboard"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            User dashboard
          </a>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total" value={`${counts.total}`} hint="Loaded list" tone="primary" />
        <StatCard label="Submitted" value={`${counts.submitted}`} hint="Ready to file" />
        <StatCard label="OTP required" value={`${counts.otp}`} hint="Waiting user OTP" tone="warn" />
        <StatCard label="In review" value={`${counts.review}`} hint="Being processed" />
      </div>

      <div className="mt-6">
        <SectionCard
          title="Inbox"
          description="Pick a case, verify docs, request OTP, and file on government portal."
          actions={
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="submitted">submitted</option>
              <option value="otp_required">otp_required</option>
              <option value="in_review">in_review</option>
              <option value="filed">filed</option>
              <option value="completed">completed</option>
              <option value="rejected">rejected</option>
              <option value="all">all</option>
            </select>
          }
        >
          {error ? (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
              Loading…
            </div>
          ) : items.length ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-12 gap-3 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700">
                <div className="col-span-4">Enterprise/User</div>
                <div className="col-span-4">Renewal</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Updated</div>
              </div>
              <div className="divide-y divide-slate-200">
                {items.map((r) => (
                  <a
                    key={r.id}
                    href={`#/admin/renewals/${encodeURIComponent(r.id)}`}
                    className="grid grid-cols-12 gap-3 px-4 py-3 hover:bg-slate-50"
                  >
                    <div className="col-span-4 min-w-0">
                      <div className="truncate text-sm font-semibold">{r.user?.name || '—'}</div>
                      <div className="mt-0.5 truncate text-xs text-slate-600">{r.user?.email || '—'}</div>
                    </div>
                    <div className="col-span-4 min-w-0">
                      <div className="truncate text-sm font-semibold">{r.renewal_type_name}</div>
                      <div className="mt-0.5 truncate text-xs text-slate-600">{r.renewal_type_code}</div>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <Pill tone={r.status === 'submitted' ? 'info' : r.status === 'otp_required' ? 'warn' : 'ok'}>
                        {r.status}
                      </Pill>
                    </div>
                    <div className="col-span-2 flex items-center justify-end text-xs text-slate-600">
                      {r.updated_at ? new Date(r.updated_at).toLocaleString() : '—'}
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
    </PageShell>
  )
}

export default AdminRenewalsPage

