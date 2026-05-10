import { useMemo, useState } from 'react'
import { PageShell, SectionCard } from './dashboard/DashboardComponents.jsx'
import { useAppActions, useAppState } from '../state/appStore.jsx'
import { api } from '../lib/apiClient.js'

function DocumentsPage() {
  const { documents } = useAppState()
  const { refreshDocuments } = useAppActions()
  const [savingId, setSavingId] = useState('')
  const [deletingId, setDeletingId] = useState('')
  const [error, setError] = useState('')

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
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Back
          </a>
          <button
            onClick={refreshDocuments}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
      }
    >
      <SectionCard title="Your uploads" description="Add correct tags so renewals can validate checklists.">
        {error ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
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
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
            No documents uploaded yet. Upload from Dashboard.
          </div>
        )}
      </SectionCard>
    </PageShell>
  )
}

function DocumentRow({ doc, tagOptions, saving, deleting, onUpdateTags, onDelete }) {
  const id = doc._id || doc.id
  const current = Array.isArray(doc.tags) ? doc.tags : []
  const [tags, setTags] = useState(current)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{doc.original_name}</div>
          <div className="mt-1 text-xs text-slate-600">
            {typeof doc.size_bytes === 'number' ? `${(doc.size_bytes / 1024).toFixed(0)} KB` : ''}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {tagOptions.map((t) => {
              const checked = tags.includes(t)
              return (
                <label
                  key={t}
                  className={[
                    'cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold transition',
                    checked
                      ? 'border-[#1E5AA6]/30 bg-[#1E5AA6]/10 text-[#1E5AA6]'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
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
                  {t}
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
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Open
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => onUpdateTags(id, tags)}
            disabled={saving || deleting}
            className="rounded-xl bg-[#1E5AA6] px-3 py-2 text-sm font-semibold text-white hover:bg-[#184D8E] disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save tags'}
          </button>
          <button
            type="button"
            onClick={() => onDelete(id)}
            disabled={saving || deleting}
            className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DocumentsPage

