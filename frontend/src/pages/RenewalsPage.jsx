import { useEffect, useMemo, useState } from 'react'
import { PageShell, SectionCard, StatCard } from './dashboard/DashboardComponents.jsx'
import { useAppActions, useAppState } from '../state/appStore.jsx'
import { EmptyState, Modal, Pill } from './renewals/RenewalComponents.jsx'
import { normalizeStatus } from '../lib/applicationRecords.js'

function RenewalsPage() {
  const { renewals, renewalTypes, loading, errors } = useAppState()
  const { refreshRenewals, fetchRenewalTypes, createRenewal } = useAppActions()
  const [open, setOpen] = useState(false)
  const [types, setTypes] = useState([])
  const [typeLoading, setTypeLoading] = useState(false)
  const [creating, setCreating] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    refreshRenewals()
  }, [refreshRenewals])

  const stats = useMemo(() => {
    const list = Array.isArray(renewals) ? renewals : []
    return {
      total: list.length,
      drafts: list.filter((r) => r.status === 'draft').length,
      submitted: list.filter((r) => r.status === 'submitted').length,
    }
  }, [renewals])

  const typeNameByCode = useMemo(() => {
    const map = new Map()
    for (const t of renewalTypes || []) map.set(t.code, t.name)
    return map
  }, [renewalTypes])

  async function openCreate() {
    setError('')
    setOpen(true)
    setTypeLoading(true)
    try {
      const t = await fetchRenewalTypes()
      setTypes(t)
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to load types')
    } finally {
      setTypeLoading(false)
    }
  }

  async function onCreate(code) {
    setCreating(code)
    setError('')
    try {
      const renewal = await createRenewal(code)
      setOpen(false)
      window.location.hash = `#/renewals/${encodeURIComponent(renewal?._id || renewal?.id)}`
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to create renewal')
    } finally {
      setCreating('')
    }
  }

  return (
    <PageShell
      title="Renewals"
      subtitle="Create and track your renewal applications"
      right={
        <div className="flex items-center gap-2">
          <a
            href="#/dashboard"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Back
          </a>
          <button
            onClick={openCreate}
            className="rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:scale-105 shadow-md shadow-primary-500/20"
          >
            + New renewal
          </button>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total" value={`${stats.total}`} hint="All applications" tone="primary" />
        <StatCard label="Drafts" value={`${stats.drafts}`} hint="Not submitted yet" />
        <StatCard label="Submitted" value={`${stats.submitted}`} hint="Sent for processing" />
      </div>

      <div className="mt-6">
        <SectionCard
          title="Your applications"
          description="Click an application to continue or view status."
          actions={
            <button
              onClick={refreshRenewals}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Refresh
            </button>
          }
        >
          {errors.bootstrap ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {errors.bootstrap}
            </div>
          ) : null}

          {loading.bootstrap ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">Loading…</div>
          ) : renewals?.length ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-12 gap-3 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700">
                <div className="col-span-6">Type</div>
                <div className="col-span-3">Status</div>
                <div className="col-span-3 text-right">Updated</div>
              </div>
              <div className="divide-y divide-slate-200">
                {renewals.slice(0, 25).map((r) => (
                  <a
                    key={r._id || r.id}
                    href={`#/renewals/${encodeURIComponent(r._id || r.id)}`}
                    className="grid grid-cols-12 gap-3 px-4 py-3 hover:bg-slate-50"
                  >
                    <div className="col-span-6 min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {typeNameByCode.get(r.renewal_type_code) || r.renewal_type_code}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-slate-600">
                        {r.submitted_at ? 'Submitted' : 'Draft in progress'}
                      </div>
                    </div>
                    <div className="col-span-3 flex items-center">
                      <Pill tone={r.status === 'rejected' ? 'warn' : r.status === 'approved' || r.status === 'completed' ? 'ok' : 'info'}>
                        {normalizeStatus(r.status)}
                      </Pill>
                    </div>
                    <div className="col-span-3 flex items-center justify-end text-xs text-slate-600">
                      {r.updated_at ? new Date(r.updated_at).toLocaleString() : '—'}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              title="No renewals yet"
              description="Create your first renewal application to get started."
              action={
                <button
                  onClick={openCreate}
                  className="rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:scale-105 shadow-md shadow-primary-500/20"
                >
                  Create renewal
                </button>
              }
            />
          )}
        </SectionCard>
      </div>

      <Modal open={open} title="Create a new renewal" onClose={() => setOpen(false)}>
        {error ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {typeLoading ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
            Loading renewal types…
          </div>
        ) : (
          <div className="grid gap-3">
            {types.map((t) => (
              <button
                key={t.code}
                type="button"
                onClick={() => onCreate(t.code)}
                disabled={!!creating}
                className="rounded-2xl border border-slate-200 bg-white p-4 text-left hover:bg-slate-50 disabled:opacity-60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="mt-1 text-sm text-slate-600">{t.description}</div>
                  </div>
                  <span className="shrink-0 rounded-full bg-gradient-to-r from-primary-600 to-indigo-600/10 px-2.5 py-1 text-xs font-semibold text-[#1E5AA6]">
                    {creating === t.code ? 'Creating…' : 'Select'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </Modal>
    </PageShell>
  )
}

export default RenewalsPage
