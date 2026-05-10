import { useEffect, useMemo, useState } from 'react'
import { PageShell, SectionCard } from './dashboard/DashboardComponents.jsx'
import { useAppActions, useAppState } from '../state/appStore.jsx'
import { Pill } from './renewals/RenewalComponents.jsx'

function RenewalDetailPage({ id }) {
  const { documents } = useAppState()
  const { getRenewal, updateRenewalDraft, submitRenewal, refreshRenewals } = useAppActions()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [renewal, setRenewal] = useState(null)
  const [type, setType] = useState(null)

  const [selectedDocs, setSelectedDocs] = useState([])
  const [fields, setFields] = useState({})

  useEffect(() => {
    let mounted = true
    async function load() {
      setError('')
      setLoading(true)
      try {
        const res = await getRenewal(id)
        if (!mounted) return
        setRenewal(res.renewal)
        setType(res.type)
        const f = res.renewal?.fields || {}
        setFields(f)
        setSelectedDocs(res.renewal?.document_ids || [])
      } catch (e) {
        setError(e?.response?.data?.message || e.message || 'Failed to load')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [getRenewal, id])

  const requiredTags = useMemo(() => (type?.required_document_tags || []).filter(Boolean), [type])

  const docsById = useMemo(() => {
    const map = new Map()
    for (const d of documents || []) map.set(d._id || d.id, d)
    return map
  }, [documents])

  const selected = useMemo(
    () => (selectedDocs || []).map((did) => docsById.get(did)).filter(Boolean),
    [selectedDocs, docsById],
  )

  const selectedTagSet = useMemo(() => {
    const set = new Set()
    for (const d of selected) for (const t of d.tags || []) set.add(t)
    return set
  }, [selected])

  const missingTags = useMemo(
    () => requiredTags.filter((t) => !selectedTagSet.has(t)),
    [requiredTags, selectedTagSet],
  )

  async function onSave() {
    if (!renewal) return
    setError('')
    setSaving(true)
    try {
      const updated = await updateRenewalDraft(renewal._id || renewal.id, {
        fields,
        documentIds: selectedDocs,
      })
      setRenewal(updated)
      await refreshRenewals()
    } catch (e) {
      const msg =
        e?.response?.data?.errors?.documents?.[0] ||
        e?.response?.data?.message ||
        e.message
      setError(msg || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function onSubmit() {
    if (!renewal) return
    setError('')
    setSubmitting(true)
    try {
      await onSave()
      const updated = await submitRenewal(renewal._id || renewal.id)
      setRenewal(updated)
    } catch (e) {
      const msg =
        e?.response?.data?.errors?.documents?.[0] ||
        e?.response?.data?.message ||
        e.message
      setError(msg || 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell
      title="Renewal details"
      subtitle={type?.name || renewal?.renewal_type_code || 'Renewal'}
      right={
        <div className="flex items-center gap-2">
          <a
            href="#/renewals"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Back
          </a>
          {renewal?.status === 'draft' ? (
            <>
              <button
                onClick={onSave}
                disabled={saving || loading}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save draft'}
              </button>
              <button
                onClick={onSubmit}
                disabled={submitting || loading}
                className="rounded-xl bg-[#1E5AA6] px-3 py-2 text-sm font-semibold text-white hover:bg-[#184D8E] disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Submit'}
              </button>
            </>
          ) : (
            <Pill tone="ok">Submitted</Pill>
          )}
        </div>
      }
    >
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">Loading…</div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <SectionCard
              title="Basic details"
              description="Fill the required information for this renewal."
            >
              <DynamicFields
                schema={type?.fields_schema || []}
                values={fields}
                disabled={renewal.status !== 'draft'}
                onChange={(next) => setFields(next)}
              />
            </SectionCard>

            <SectionCard
              title="Attach documents"
              description="Select uploaded documents required for this renewal."
            >
              {documents?.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {documents.slice(0, 20).map((d) => {
                    const did = d._id || d.id
                    const checked = selectedDocs.includes(did)
                    return (
                      <label
                        key={did}
                        className={[
                          'flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition',
                          checked ? 'border-[#1E5AA6]/40 bg-[#1E5AA6]/5' : 'border-slate-200 bg-white hover:bg-slate-50',
                        ].join(' ')}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={renewal.status !== 'draft'}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? Array.from(new Set([...selectedDocs, did]))
                              : selectedDocs.filter((x) => x !== did)
                            setSelectedDocs(next)
                          }}
                          className="mt-1"
                        />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">{d.original_name}</div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {(d.tags || []).slice(0, 4).map((t) => (
                              <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                  No documents found. Upload documents from Dashboard first.
                </div>
              )}
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard title="Checklist" description="Required documents for submission.">
              {requiredTags.length ? (
                <div className="space-y-2">
                  {requiredTags.map((t) => {
                    const ok = selectedTagSet.has(t)
                    return (
                      <div key={t} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <span className="text-sm text-slate-800">{t}</span>
                        <span className={ok ? 'text-emerald-700' : 'text-amber-800'}>{ok ? '✓' : '!'}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-sm text-slate-600">No checklist configured.</div>
              )}

              {missingTags.length ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  Missing: {missingTags.join(', ')}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                  Ready to submit.
                </div>
              )}
            </SectionCard>

            <SectionCard title="Status" description="Current stage of your renewal.">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{renewal.status}</div>
                <Pill tone={renewal.status === 'submitted' ? 'ok' : 'warn'}>{renewal.status}</Pill>
              </div>
              <div className="mt-2 text-sm text-slate-600">
                {renewal.submitted_at ? `Submitted at ${new Date(renewal.submitted_at).toLocaleString()}` : 'Not submitted yet.'}
              </div>
            </SectionCard>
          </div>
        </div>
      )}
    </PageShell>
  )
}

function DynamicFields({ schema, values, onChange, disabled }) {
  const items = Array.isArray(schema) ? schema : []
  if (!items.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
        No fields configured for this renewal type.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((f) => {
        const key = f.key
        const label = f.label || key
        const required = !!f.required
        const type = f.type || 'text'
        const max = typeof f.max === 'number' ? f.max : undefined
        const value = values?.[key] ?? ''

        const common = {
          value,
          disabled,
          maxLength: max,
          onChange: (e) => onChange({ ...(values || {}), [key]: e.target.value }),
          className:
            'mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1E5AA6]/30 disabled:bg-slate-50',
        }

        return (
          <label key={key} className="block text-sm font-medium text-slate-700">
            <span className="inline-flex items-center gap-2">
              {label}
              {required ? (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-800">
                  Required
                </span>
              ) : null}
            </span>
            {type === 'textarea' ? (
              <textarea {...common} rows={4} placeholder={f.placeholder || ''} />
            ) : (
              <input {...common} type="text" placeholder={f.placeholder || ''} />
            )}
            {max ? (
              <div className="mt-1 text-xs text-slate-500">Max {max} characters</div>
            ) : null}
          </label>
        )
      })}
    </div>
  )
}

export default RenewalDetailPage
