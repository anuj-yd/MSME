import { useEffect, useMemo, useState } from 'react'
import { useAppActions, useAppState } from '../state/appStore.jsx'
import {
  DragAndDropUpload,
  LockedPanel,
  PageShell,
  PremiumBlur,
  SectionCard,
  StatCard,
} from './dashboard/DashboardComponents.jsx'
import { statusPillClass } from './dashboard/sampleData.js'
import { api } from '../lib/apiClient.js'

function UserDashboardPage() {
  const { authToken, user, entitlement, documents, renewals, renewalTypes, loading, errors } = useAppState()
  const { bootstrap, logout, uploadDocument, refreshDocuments } = useAppActions()
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState('')
  const [uploadTags, setUploadTags] = useState(['general'])

  const isPremium = !!entitlement?.is_premium
  const renewalSummary = useMemo(() => {
    const list = Array.isArray(renewals) ? renewals : []
    const total = list.length
    const submitted = list.filter((r) => r.status === 'submitted').length
    const drafts = list.filter((r) => r.status === 'draft').length
    return { total, submitted, drafts }
  }, [renewals])

  const typeNameByCode = useMemo(() => {
    const map = new Map()
    for (const t of renewalTypes || []) map.set(t.code, t.name)
    return map
  }, [renewalTypes])

  async function downloadRenewalReport() {
    setReportError('')
    setReportLoading(true)
    try {
      const res = await api.get('/reports/renewal-summary.csv', { responseType: 'blob' })
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'renewal-summary.csv'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      setReportError(e?.response?.data?.message || e.message || 'Failed to download report')
    } finally {
      setReportLoading(false)
    }
  }

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  if (!authToken) {
    window.location.hash = '#/login'
    return null
  }

  return (
    <PageShell
      title="Dashboard"
      subtitle="Renewal Portal for MSEs"
      right={
        <div className="flex items-center gap-2">
          <a
            href="#/"
            className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 md:inline-flex"
          >
            Landing
          </a>
          <button
            onClick={async () => {
              await logout()
              window.location.hash = '#/login'
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      }
    >
      {loading.bootstrap ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          Loading…
        </div>
      ) : errors.bootstrap ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          {errors.bootstrap}
          <div className="mt-3">
            <button
              onClick={() => {
                logout()
                window.location.hash = '#/login'
              }}
              className="rounded-xl bg-rose-700 px-3 py-2 text-sm font-semibold text-white"
            >
              Re-login
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Active renewals"
              value={`${renewalSummary.total}`}
              hint={`${renewalSummary.drafts} drafts • ${renewalSummary.submitted} submitted`}
              tone="primary"
            />
            <StatCard label="Documents" value={`${documents.length}`} hint="Uploaded in vault" />
            <StatCard label="Next deadline" value="3 days" hint="Shop & Establishment" tone="warn" />
          </div>

            <SectionCard
              title={`Welcome, ${user?.name || 'User'}`}
              description="Your account overview and quick actions."
              actions={
                isPremium ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-600/10 px-3 py-2 text-xs font-semibold text-emerald-700">
                    Premium active
                  </span>
                ) : (
                  <a
                    href="#/pricing"
                    className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:scale-105 shadow-md shadow-primary-500/20"
                  >
                    Upgrade
                  </a>
                )
              }
            >
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs text-slate-600">Email</div>
                  <div className="mt-1 truncate text-sm font-semibold text-slate-900">
                    {user?.email}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs text-slate-600">Plan</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {isPremium ? 'Premium' : 'Free'}
                  </div>
                  {isPremium && entitlement?.premium_until ? (
                    <div className="mt-1 text-xs text-slate-600">
                      Valid till: {new Date(entitlement.premium_until).toLocaleDateString()}
                    </div>
                  ) : null}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs text-slate-600">Status</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    Verified
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Renewals"
              description="Your latest renewal applications."
              actions={
                <a
                  href="#/renewals"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  View all
                </a>
              }
            >
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between bg-slate-50 px-4 py-3">
                  <div className="text-xs font-semibold text-slate-700">Recent</div>
                  <div className="text-xs text-slate-600">Status</div>
                </div>
                <div className="divide-y divide-slate-200">
                  {(renewals || []).slice(0, 5).map((r) => (
                    <div key={r._id || r.id} className="flex items-center justify-between gap-4 px-4 py-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">
                          {typeNameByCode.get(r.renewal_type_code) || r.renewal_type_code || 'Renewal'}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-600">
                          {r.submitted_at ? `Submitted: ${new Date(r.submitted_at).toLocaleString()}` : 'Draft'}
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusPillClass(r.status === 'submitted' ? 'info' : 'warn')}`}>
                        {r.status}
                      </span>
                    </div>
                  ))}
                  {!renewals?.length ? (
                    <div className="px-4 py-8 text-center text-sm text-slate-600">
                      No renewals yet. Next step: create a renewal flow UI.
                    </div>
                  ) : null}
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Documents"
              description="Upload and manage required documents for renewals."
              actions={
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => refreshDocuments()}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    Refresh
                  </button>
                  <a
                    href="#/renewals"
                    className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Use in renewal
                  </a>
                </div>
              }
            >
              <TagPicker value={uploadTags} onChange={setUploadTags} />
              <DragAndDropUpload
                onFiles={async (files) => {
                  setUploadError('')
                  setUploading(true)
                  try {
                    const selected = files.slice(0, 5).filter((f) => f.size <= 10 * 1024 * 1024)
                    for (const file of selected) await uploadDocument(file, uploadTags)
                  } catch (err) {
                    setUploadError(err?.response?.data?.message || err.message || 'Upload failed')
                  } finally {
                    setUploading(false)
                  }
                }}
              />

              {uploadError ? (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {uploadError}
                </div>
              ) : null}

              {uploading ? (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  Uploading…
                </div>
              ) : null}

              {documents.length ? (
                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between bg-slate-50 px-4 py-3">
                    <div className="text-xs font-semibold text-slate-700">Recent uploads</div>
                    <div className="text-xs text-slate-600">{documents.length} total</div>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {documents.slice(0, 6).map((d) => (
                      <div key={d._id || d.id} className="flex items-center justify-between gap-4 px-4 py-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{d.original_name}</div>
                          <div className="mt-0.5 text-xs text-slate-600">
                            {typeof d.size_bytes === 'number' ? `${(d.size_bytes / 1024).toFixed(0)} KB` : ''}
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          {d.imagekit_url ? (
                            <a
                              href={d.imagekit_url}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                            >
                              Open
                            </a>
                          ) : null}
                          <span className="rounded-full bg-emerald-600/10 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            Uploaded
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard title="Premium access" description="Unlock downloads and full details.">
              <LockedPanel locked={!isPremium} label="Premium">
                <div className="p-6">
                  <div className="text-sm font-semibold">Unlocked features</div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    <li className="flex items-center justify-between">
                      <span>Download renewal report</span>
                      <span className="text-emerald-700">✓</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>View full application details</span>
                      <span className="text-emerald-700">✓</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Priority support</span>
                      <span className="text-emerald-700">✓</span>
                    </li>
                  </ul>
                </div>
              </LockedPanel>
            </SectionCard>

            <SectionCard title="Download center" description="Premium-only downloads (demo).">
              <PremiumBlur locked={!isPremium}>
                <div className="p-6">
                  <div className="text-sm font-semibold">Renewal report</div>
                  <div className="mt-1 text-sm text-slate-600">
                    Download a summary report for your submitted renewals.
                  </div>
                  {reportError ? (
                    <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                      {reportError}
                    </div>
                  ) : null}
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                    onClick={downloadRenewalReport}
                    disabled={reportLoading}
                  >
                    {reportLoading ? 'Downloading…' : 'Download report'}
                  </button>
                </div>
              </PremiumBlur>
            </SectionCard>

            <SectionCard title="Quick links" description="Navigate faster.">
              <div className="grid gap-2 text-sm">
                <a className="rounded-xl border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50" href="#/pricing">
                  Billing / Upgrade
                </a>
                <a className="rounded-xl border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50" href="#/renewals">
                  Renewals
                </a>
                <a className="rounded-xl border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50" href="#/documents">
                  Documents
                </a>
                <a className="rounded-xl border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50" href="#/">
                  Landing page
                </a>
              </div>
            </SectionCard>
          </div>
        </div>
      )}
    </PageShell>
  )
}

function TagPicker({ value, onChange }) {
  const options = [
    'general',
    'identity',
    'address',
    'license_copy',
    'registration_copy',
    'udyam_certificate',
  ]

  const selected = Array.isArray(value) && value.length ? value : ['general']

  return (
    <div className="mb-4">
      <div className="text-xs font-semibold text-slate-700">Tags for next upload</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((t) => {
          const checked = selected.includes(t)
          return (
            <label
              key={t}
              className={[
                'cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold transition',
                checked
                  ? 'border-primary-300 bg-primary-50 text-primary-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
              ].join(' ')}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={checked}
                onChange={(e) => {
                  const next = e.target.checked
                    ? Array.from(new Set([...selected, t]))
                    : selected.filter((x) => x !== t)
                  onChange(next.length ? next : ['general'])
                }}
              />
              {t}
            </label>
          )
        })}
      </div>
      <div className="mt-2 text-xs text-slate-600">
        Tip: set correct tags (like <span className="font-semibold">identity</span>, <span className="font-semibold">address</span>) so renewal submission passes checklist.
      </div>
    </div>
  )
}

export default UserDashboardPage
