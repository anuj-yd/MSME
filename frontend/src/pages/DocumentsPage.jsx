import { useEffect, useMemo, useState } from 'react'
import { PageShell, SectionCard } from './dashboard/DashboardComponents.jsx'
import { useAppActions, useAppState } from '../state/appStore.jsx'
import { api } from '../lib/apiClient.js'

function DocumentsPage() {
  const { documents, documentVault, user } = useAppState()
  const {
    refreshDocuments,
    getDocumentVaultStatus,
    requestDocumentVaultOtp,
    verifyDocumentVaultOtp,
  } = useAppActions()
  const [savingId, setSavingId] = useState('')
  const [deletingId, setDeletingId] = useState('')
  const [error, setError] = useState('')
  const [vaultOtp, setVaultOtp] = useState('')
  const [vaultLoading, setVaultLoading] = useState('')
  const [vaultError, setVaultError] = useState('')
  const [vaultMessage, setVaultMessage] = useState('')

  const isVaultUnlocked = !!documentVault?.unlocked

  const tagOptions = useMemo(
    () => [
      'general',
      'identity',
      'address',
      'license_copy',
      'registration_copy',
      'udyam_certificate',
    ],
    [],
  )

  useEffect(() => {
    let mounted = true

    async function loadVault() {
      try {
        const vault = await getDocumentVaultStatus()
        if (mounted && vault?.unlocked) await refreshDocuments()
      } catch (e) {
        if (mounted) setError(e?.response?.data?.message || e.message || 'Failed to load document vault')
      }
    }

    loadVault()
    return () => {
      mounted = false
    }
  }, [getDocumentVaultStatus, refreshDocuments])

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

  async function updateTags(docId, tags) {
    setError('')
    setSavingId(docId)
    try {
      await api.patch(`/documents/${docId}`, { tags })
      await refreshDocuments()
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to update tags')
    } finally {
      setSavingId('')
    }
  }

  async function deleteDoc(docId) {
    if (!confirm('Delete this document?')) return
    setError('')
    setDeletingId(docId)
    try {
      await api.delete(`/documents/${docId}`)
      await refreshDocuments()
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to delete')
    } finally {
      setDeletingId('')
    }
  }

  return (
    <PageShell
      title="Documents"
      subtitle="Manage uploaded documents and tags"
      right={
        <div className="flex items-center gap-2">
          <a
            href="#/dashboard"
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            Back
          </a>
          {isVaultUnlocked ? (
            <button
              onClick={refreshDocuments}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
              Refresh
            </button>
          ) : null}
        </div>
      }
    >
      <SectionCard title="Your uploads" description="Add correct tags so renewals can validate checklists.">
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
        {error ? (
          <div className="mb-4 rounded-xl border border-rose-200 dark:border-rose-900/35 bg-rose-50 dark:bg-rose-950/20 px-3 py-2 text-sm font-semibold text-rose-700 dark:text-rose-400">
            {error}
          </div>
        ) : null}

        {documents?.length ? (
          <div className="space-y-4">
            {documents.slice(0, 25).map((d) => (
              <DocumentRow
                key={d._id || d.id}
                doc={d}
                tagOptions={tagOptions}
                saving={savingId === (d._id || d.id)}
                deleting={deletingId === (d._id || d.id)}
                onUpdateTags={updateTags}
                onDelete={deleteDoc}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-205 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/30 px-4 py-4 text-sm font-semibold text-slate-700 dark:text-slate-400">
            No documents uploaded yet. Upload from Dashboard.
          </div>
        )}
          </>
        )}
      </SectionCard>
    </PageShell>
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
          <p className="mt-2 text-sm leading-relaxed text-slate-655 dark:text-slate-400">
            A 4-digit code will be sent to {email || 'your registered email'} before documents can be opened.
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
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 px-4 py-3 text-center text-2xl font-bold tracking-[0.4em] text-slate-900 dark:text-white outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:bg-white dark:focus:bg-slate-900 transition"
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

function DocumentRow({ doc, tagOptions, saving, deleting, onUpdateTags, onDelete }) {
  const id = doc._id || doc.id
  const current = Array.isArray(doc.tags) ? doc.tags : []
  const [tags, setTags] = useState(current)

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900/40 p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-slate-900 dark:text-white">{doc.original_name}</div>
          <div className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {typeof doc.size_bytes === 'number' ? `${(doc.size_bytes / 1024).toFixed(0)} KB` : ''}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {tagOptions.map((t) => {
              const checked = tags.includes(t)
              return (
                <label
                  key={t}
                  className={[
                    'cursor-pointer rounded-full border px-3 py-1 text-xs font-bold transition shadow-sm',
                    checked
                      ? 'border-primary-400 dark:border-primary-800 bg-primary-50 dark:bg-primary-950/40 text-primary-750 dark:text-primary-400 ring-2 ring-primary-500/10'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900',
                  ].join(' ')}
                >
                  <input
                    className="hidden"
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? Array.from(new Set([...tags, t]))
                        : tags.filter((x) => x !== t)
                      setTags(next)
                    }}
                  />
                  {t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </label>
              )
            })}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {doc.imagekit_url ? (
            <a
              href={doc.imagekit_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors shadow-sm"
            >
              Open
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => onUpdateTags(id, tags)}
            disabled={saving || deleting}
            className="rounded-xl bg-slate-900 dark:bg-white px-3 py-2 text-sm font-bold text-white dark:text-slate-900 hover:bg-slate-850 dark:hover:bg-slate-100 transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save tags'}
          </button>
          <button
            type="button"
            onClick={() => onDelete(id)}
            disabled={saving || deleting}
            className="rounded-xl border border-rose-200 dark:border-rose-900/35 bg-rose-50 dark:bg-rose-950/20 px-3 py-2 text-sm font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DocumentsPage
