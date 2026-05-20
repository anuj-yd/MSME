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
import { readApplicationRecords } from '../lib/applicationRecords.js'

const TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'profile', label: 'My Profile', icon: '👤' },
  { id: 'renewals', label: 'Licenses & Renewals', icon: '📝' },
  { id: 'documents', label: 'Document Vault', icon: '📂' },
  { id: 'premium', label: 'Premium & Extras', icon: '⭐' },
]

function UserDashboardPage() {
  const { authToken, user, entitlement, documentVault, documents, renewals, renewalTypes, loading, errors } = useAppState()
  const {
    bootstrap,
    logout,
    uploadDocument,
    refreshDocuments,
    requestDocumentVaultOtp,
    verifyDocumentVaultOtp,
  } = useAppActions()
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState('')
  const [uploadTags, setUploadTags] = useState(['general'])
  const [activeTab, setActiveTab] = useState('overview')
  const [vaultOtp, setVaultOtp] = useState('')
  const [vaultLoading, setVaultLoading] = useState('')
  const [vaultError, setVaultError] = useState('')
  const [vaultMessage, setVaultMessage] = useState('')
  const [trackingRecords, setTrackingRecords] = useState([])

  const isPremium = !!entitlement?.is_premium
  const isVaultUnlocked = !!documentVault?.unlocked
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

  async function sendVaultOtp() {
    setVaultError('')
    setVaultMessage('')
    setVaultLoading('send')
    try {
      await requestDocumentVaultOtp()
      setVaultMessage('OTP sent to your registered email.')
    } catch (e) {
      const msg =
        e?.response?.data?.errors?.otp?.[0] ||
        e?.response?.data?.message ||
        e.message ||
        'Failed to send OTP'
      setVaultError(msg)
    } finally {
      setVaultLoading('')
    }
  }

  async function verifyVaultOtp(e) {
    e.preventDefault()
    setVaultError('')
    setVaultMessage('')
    setVaultLoading('verify')
    try {
      await verifyDocumentVaultOtp(vaultOtp)
      setVaultOtp('')
      setVaultMessage('Document vault unlocked.')
    } catch (err) {
      const msg =
        err?.response?.data?.errors?.otp?.[0] ||
        err?.response?.data?.message ||
        err.message ||
        'OTP verification failed'
      setVaultError(msg)
    } finally {
      setVaultLoading('')
    }
  }

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  useEffect(() => {
    if (user?.role === 'admin') window.location.hash = '#/admin/dashboard'
  }, [user])

  useEffect(() => {
    if (!authToken) {
      window.location.hash = '#/login'
    }
  }, [authToken])

  useEffect(() => {
    function syncTrackingRecords() {
      setTrackingRecords(readApplicationRecords().slice(0, 5))
    }

    syncTrackingRecords()
    window.addEventListener('application-records-change', syncTrackingRecords)
    return () => window.removeEventListener('application-records-change', syncTrackingRecords)
  }, [])

  if (!authToken) {
    return null
  }

  return (
    <PageShell
      title="Dashboard"
      subtitle="Renewal Portal for MSEs"
      right={
        <div className="flex items-center gap-2">
          <a
            href="#/smart-assistant"
            className="hidden rounded-xl border border-primary-100 dark:border-primary-900/30 bg-primary-50 dark:bg-primary-950/20 px-3 py-2 text-sm font-semibold text-primary-700 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-950/30 md:inline-flex shadow-sm"
          >
            Renewal Guide
          </a>
          <a
            href="#/"
            className="hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 md:inline-flex shadow-sm"
          >
            Landing
          </a>
          <button
            onClick={async () => {
              await logout()
              window.location.hash = '#/login'
            }}
            className="rounded-xl border border-rose-200 dark:border-rose-900/40 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 shadow-sm"
          >
            Logout
          </button>
        </div>
      }
    >
      {loading.bootstrap ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-6 shadow-sm flex items-center justify-center">
          <div className="text-slate-655 dark:text-slate-400 font-medium">Loading your dashboard…</div>
        </div>
      ) : errors.bootstrap ? (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900/35 bg-rose-50/80 dark:bg-rose-950/20 backdrop-blur-md p-6 text-rose-700 dark:text-rose-400 shadow-sm">
          {errors.bootstrap}
          <div className="mt-4">
            <button
              onClick={() => {
                logout()
                window.location.hash = '#/login'
              }}
              className="rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 px-4 py-2 text-sm font-bold text-white shadow-md shadow-rose-500/20 hover:scale-105 transition-transform"
            >
              Re-login
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="md:w-64 shrink-0">
            <div className="sticky top-24">
              <nav className="flex md:flex-col gap-3 overflow-x-auto pb-4 md:pb-0 hide-scrollbar">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-lg shadow-primary-500/30 scale-100'
                        : 'bg-white/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white border border-white/60 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm scale-95 hover:scale-100'
                    }`}
                  >
                    <span className="text-xl">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content Area */}
          <div className="flex-1 min-w-0 space-y-6">
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid gap-4 md:grid-cols-3">
                  <StatCard
                    label="Active renewals"
                    value={`${renewalSummary.total}`}
                    hint={`${renewalSummary.drafts} drafts • ${renewalSummary.submitted} submitted`}
                    tone="primary"
                  />
                  <StatCard
                    label="Documents"
                    value={isVaultUnlocked ? `${documents.length}` : 'Locked'}
                    hint={isVaultUnlocked ? 'Uploaded in vault' : 'OTP required'}
                  />
                  <StatCard label="Next deadline" value="3 days" hint="Shop & Establishment" tone="warn" />
                </div>
                
                <SectionCard title="Quick links" description="Navigate faster.">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <a className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-primary-100 dark:border-primary-900/30 bg-primary-50/70 dark:bg-primary-950/20 p-4 text-center hover:bg-primary-50 dark:hover:bg-primary-950/30 hover:shadow-md transition-all duration-300" href="#/smart-assistant">
                      <span className="text-sm font-black tracking-wider text-primary-700 dark:text-primary-400">GUIDE</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Smart Assistant</span>
                    </a>
                    <a className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 p-4 text-center hover:bg-white dark:hover:bg-slate-900 hover:shadow-md transition-all duration-300" href="#/pricing">
                      <span className="text-2xl">💳</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Billing / Upgrade</span>
                    </a>
                    <a className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 p-4 text-center hover:bg-white dark:hover:bg-slate-900 hover:shadow-md transition-all duration-300" href="#/renewals">
                      <span className="text-2xl">🔄</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Renewals</span>
                    </a>
                    <a className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 p-4 text-center hover:bg-white dark:hover:bg-slate-900 hover:shadow-md transition-all duration-300" href="#/documents">
                      <span className="text-2xl">📄</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Documents</span>
                    </a>
                    <a className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 p-4 text-center hover:bg-white dark:hover:bg-slate-900 hover:shadow-md transition-all duration-300" href="#/">
                      <span className="text-2xl">🏠</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Landing page</span>
                    </a>
                  </div>
                </SectionCard>

                <SectionCard title="Application tracking" description="Recent application tracking cards.">
                  <div className="mb-4">
                    <a
                      href="#/track"
                      className="inline-flex rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-bold text-slate-800 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Track by ID
                    </a>
                  </div>
                  {trackingRecords.length ? (
                    <div className="grid gap-3">
                      {trackingRecords.map((record) => (
                        <a
                          key={record.id}
                          href={`#/track?trackingId=${encodeURIComponent(record.trackingId)}`}
                          className="flex flex-col gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-4 hover:bg-white dark:hover:bg-slate-900 sm:flex-row sm:items-center sm:justify-between transition-colors duration-300"
                        >
                          <div>
                            <div className="font-mono text-sm font-black text-slate-900 dark:text-white">{record.trackingId}</div>
                            <div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                              {record.businessName || record.renewalTypeName || 'Renewal application'}
                            </div>
                          </div>
                          <span className="rounded-full bg-primary-50 dark:bg-primary-950/30 px-3 py-1 text-xs font-bold text-primary-700 dark:text-primary-400">
                            {record.status}
                          </span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20 px-4 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                      No tracking records yet. Submit a renewal/update application to generate one.
                    </div>
                  )}
                </SectionCard>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SectionCard
                  title={`Welcome, ${user?.name || 'User'}`}
                  description="Your account overview and status."
                  actions={
                    isPremium ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-700 border border-emerald-500/20">
                        🌟 Premium Active
                      </span>
                    ) : (
                      <a
                        href="#/pricing"
                        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-transform hover:scale-105"
                      >
                        Upgrade to Premium
                      </a>
                    )
                  }
                >
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/60 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 p-5 shadow-sm">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email Address</div>
                      <div className="mt-2 truncate text-base font-bold text-slate-900 dark:text-white">
                        {user?.email}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/60 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 p-5 shadow-sm">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Current Plan</div>
                      <div className="mt-2 text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {isPremium ? (
                           <><span className="text-emerald-600 dark:text-emerald-400">Premium</span></>
                        ) : 'Free'}
                      </div>
                      {isPremium && entitlement?.premium_until ? (
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                          Valid till: {new Date(entitlement.premium_until).toLocaleDateString()}
                        </div>
                      ) : null}
                    </div>
                    <div className="rounded-2xl border border-white/60 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 p-5 shadow-sm">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Account Status</div>
                      <div className="mt-2 text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        Verified
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </div>
            )}

            {activeTab === 'renewals' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SectionCard
                  title="Licenses & Renewals"
                  description="Manage your existing applications or apply for new ones."
                  actions={
                    <div className="flex gap-3">
                      <a
                        href="#/renewals"
                        className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-white shadow-sm transition-all"
                      >
                        View all
                      </a>
                      <a
                        href="#/renewals"
                        className="rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-primary-500/20 hover:scale-105 transition-transform"
                      >
                        + Apply New License
                      </a>
                    </div>
                  }
                >
                  <div className="overflow-hidden rounded-2xl border border-white/60 dark:border-slate-850 bg-white/40 dark:bg-slate-900/30 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center justify-between bg-white/60 dark:bg-slate-900/60 border-b border-white/60 dark:border-slate-850 px-5 py-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-655 dark:text-slate-400">Recent Applications</div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-655 dark:text-slate-400">Status</div>
                    </div>
                    <div className="divide-y divide-white/60 dark:divide-slate-850">
                      {(renewals || []).slice(0, 5).map((r) => (
                        <div key={r._id || r.id} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-white/40 dark:hover:bg-slate-900/20 transition-colors duration-300">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-bold text-slate-900 dark:text-white">
                              {typeNameByCode.get(r.renewal_type_code) || r.renewal_type_code || 'Renewal'}
                            </div>
                            <div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                              {r.submitted_at ? `Submitted: ${new Date(r.submitted_at).toLocaleString()}` : 'Draft'}
                            </div>
                          </div>
                          <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold border ${statusPillClass(r.status === 'submitted' ? 'info' : 'warn')}`}>
                            {r.status}
                          </span>
                        </div>
                      ))}
                      {!renewals?.length ? (
                        <div className="px-5 py-10 text-center flex flex-col items-center">
                          <div className="grid size-16 place-items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-4">
                             <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          </div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">No renewals found</div>
                          <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">Start by applying for a new license or renewal.</div>
                          <a href="#/renewals" className="mt-4 rounded-xl bg-slate-900 dark:bg-slate-100 px-5 py-2.5 text-sm font-bold text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition-all hover:scale-105">Apply Now</a>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </SectionCard>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SectionCard
                  title="Document Vault"
                  description={isVaultUnlocked ? 'Securely upload and manage documents required for your licenses.' : 'Verify OTP to unlock your saved documents.'}
                  actions={
                    isVaultUnlocked ? (
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => refreshDocuments()}
                          className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-white shadow-sm transition-all"
                        >
                          Refresh
                        </button>
                      </div>
                    ) : null
                  }
                >
                  {!isVaultUnlocked ? (
                    <DocumentVaultUnlockPanel
                      email={user?.email}
                      otp={vaultOtp}
                      loading={vaultLoading}
                      error={vaultError}
                      message={vaultMessage}
                      onOtpChange={setVaultOtp}
                      onSendOtp={sendVaultOtp}
                      onVerify={verifyVaultOtp}
                    />
                  ) : (
                    <>
                  <div className="bg-white/40 dark:bg-slate-900/40 p-6 rounded-2xl border border-white/60 dark:border-slate-850 mb-6">
                    <TagPicker value={uploadTags} onChange={setUploadTags} />
                    <div className="mt-4">
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
                    </div>
                  </div>

                  {uploadError ? (
                    <div className="mb-6 rounded-xl border border-rose-200 dark:border-rose-900/35 bg-rose-50/80 dark:bg-rose-950/20 p-4 text-sm font-medium text-rose-700 dark:text-rose-400 backdrop-blur-sm">
                      {uploadError}
                    </div>
                  ) : null}

                  {uploading ? (
                    <div className="mb-6 rounded-xl border border-primary-200 dark:border-primary-900/30 bg-primary-50/80 dark:bg-primary-950/20 p-4 text-sm font-bold text-primary-700 dark:text-primary-405 backdrop-blur-sm flex items-center gap-3">
                      <svg className="animate-spin size-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading your documents securely…
                    </div>
                  ) : null}

                  {documents.length ? (
                    <div className="overflow-hidden rounded-2xl border border-white/60 dark:border-slate-850 bg-white/40 dark:bg-slate-900/30 shadow-sm backdrop-blur-sm">
                      <div className="flex items-center justify-between bg-white/60 dark:bg-slate-900/60 border-b border-white/60 dark:border-slate-850 px-5 py-4">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-655 dark:text-slate-400">Recent Uploads</div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-655 dark:text-slate-400">{documents.length} Files</div>
                      </div>
                      <div className="divide-y divide-white/60 dark:divide-slate-850">
                        {documents.slice(0, 6).map((d) => (
                          <div key={d._id || d.id} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-white/40 dark:hover:bg-slate-900/20 transition-colors duration-300">
                            <div className="min-w-0 flex items-center gap-3">
                              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-slate-700">
                                📄
                              </div>
                              <div>
                                <div className="truncate text-sm font-bold text-slate-900 dark:text-white">{d.original_name}</div>
                                <div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                                  {typeof d.size_bytes === 'number' ? `${(d.size_bytes / 1024).toFixed(0)} KB` : ''} • Uploaded recently
                                </div>
                              </div>
                            </div>
                            <div className="shrink-0 flex items-center gap-3">
                              {d.imagekit_url ? (
                                <a
                                  href={d.imagekit_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-sm transition-all"
                                >
                                  View
                                </a>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-sm font-medium text-slate-500 dark:text-slate-400">No documents uploaded yet.</div>
                  )}
                    </>
                  )}
                </SectionCard>
              </div>
            )}

            {activeTab === 'premium' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SectionCard title="Premium access" description="Unlock reports, priority support, and full details.">
                  <LockedPanel locked={!isPremium} label="Premium">
                    <div className="p-8 bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900/60 dark:to-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-950/30">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/30">
                          <span className="text-2xl font-semibold">★</span>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-slate-900 dark:text-white">Premium Activated</div>
                          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">You have access to all exclusive features.</div>
                        </div>
                      </div>
                      <ul className="space-y-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <li className="flex items-center gap-3 bg-white dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850 shadow-sm">
                          <div className="grid size-8 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">✓</div>
                          <span>Download detailed renewal reports in CSV format</span>
                        </li>
                        <li className="flex items-center gap-3 bg-white dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850 shadow-sm">
                          <div className="grid size-8 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">✓</div>
                          <span>View full application details and status timeline</span>
                        </li>
                        <li className="flex items-center gap-3 bg-white dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850 shadow-sm">
                          <div className="grid size-8 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">✓</div>
                          <span>Priority support line (Response within 2 hours)</span>
                        </li>
                      </ul>
                    </div>
                  </LockedPanel>
                </SectionCard>

                <SectionCard title="Download center" description="Generate and download data.">
                  <PremiumBlur locked={!isPremium}>
                    <div className="p-8 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-white/60 dark:border-slate-850 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="grid size-12 place-items-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0 border border-slate-200 dark:border-slate-700">
                          📊
                        </div>
                        <div>
                          <div className="text-base font-bold text-slate-900 dark:text-white">Renewal Analytics Report</div>
                          <div className="mt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
                            Download a comprehensive summary report of all your submitted renewals, including application IDs, submission dates, and current statuses.
                          </div>
                          {reportError ? (
                            <div className="mt-4 rounded-xl border border-rose-200 dark:border-rose-900/35 bg-rose-50 dark:bg-rose-950/20 px-4 py-3 text-sm font-semibold text-rose-700 dark:text-rose-400">
                              {reportError}
                            </div>
                          ) : null}
                          <button
                            type="button"
                            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-white px-6 py-3 text-sm font-bold text-white dark:text-slate-900 shadow-md hover:bg-slate-800 dark:hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
                            onClick={downloadRenewalReport}
                            disabled={reportLoading}
                          >
                            {reportLoading ? (
                              <>
                                <svg className="animate-spin size-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                              </>
                            ) : (
                              <>
                                📥 Download Report
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </PremiumBlur>
                </SectionCard>
              </div>
            )}
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
      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Assign tags for next upload</div>
      <div className="flex flex-wrap gap-2">
        {options.map((t) => {
          const checked = selected.includes(t)
          return (
            <label
              key={t}
              className={[
                'cursor-pointer rounded-full border px-4 py-1.5 text-xs font-bold transition-all shadow-sm',
                checked
                  ? 'border-primary-400 bg-primary-50 text-primary-700 ring-2 ring-primary-500/20'
                  : 'border-white/80 bg-white/60 text-slate-600 hover:bg-white hover:text-slate-900',
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
              {t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </label>
          )
        })}
      </div>
      <div className="mt-4 text-xs font-medium text-slate-500 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50 flex gap-2">
        <span>💡</span> 
        <span><span className="font-bold text-blue-700">Tip:</span> Set correct tags (like <span className="font-bold">Identity</span>, <span className="font-bold">Address</span>) so renewal submission passes the checklist faster.</span>
      </div>
    </div>
  )
}

function DocumentVaultUnlockPanel({
  email,
  otp,
  loading,
  error,
  message,
  onOtpChange,
  onSendOtp,
  onVerify,
}) {
  const canVerify = /^[0-9]{4}$/.test(otp || '') && loading !== 'verify'

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-850 bg-white/60 dark:bg-slate-900/60 p-6 shadow-sm">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xl">
          <div className="inline-flex items-center rounded-full border border-primary-100 dark:border-primary-900/40 bg-primary-50 dark:bg-primary-950/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-700 dark:text-primary-400">
            OTP Protected
          </div>
          <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Unlock Document Vault</h3>
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-400">
            A 4-digit code will be sent to {email || 'your registered email'}. Your documents stay hidden until the code is verified.
          </p>
        </div>
        <button
          type="button"
          onClick={onSendOtp}
          disabled={!!loading}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm font-bold text-slate-800 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading === 'send' ? 'Sending...' : 'Send OTP'}
        </button>
      </div>

      <form onSubmit={onVerify} className="mt-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Enter OTP
          </label>
          <input
            value={otp}
            onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
            inputMode="numeric"
            placeholder="0000"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 px-4 py-3 text-center text-2xl font-bold tracking-[0.4em] text-slate-900 dark:text-white outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:bg-white dark:focus:bg-slate-900"
          />
        </div>
        <button
          type="submit"
          disabled={!canVerify || !!loading}
          className="rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-primary-500/20 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 transition-all duration-300"
        >
          {loading === 'verify' ? 'Verifying...' : 'Unlock Vault'}
        </button>
      </form>

      {error ? (
        <div className="mt-4 rounded-xl border border-rose-200 dark:border-rose-900/35 bg-rose-50 dark:bg-rose-950/20 px-4 py-3 text-sm font-semibold text-rose-700 dark:text-rose-400">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="mt-4 rounded-xl border border-emerald-200 dark:border-emerald-900/35 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-3 text-sm font-semibold text-emerald-805 dark:text-emerald-400">
          {message}
        </div>
      ) : null}
    </div>
  )
}

export default UserDashboardPage
