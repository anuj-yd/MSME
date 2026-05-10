export function Pill({ children, tone = 'default' }) {
  const cls =
    tone === 'ok'
      ? 'bg-emerald-600/10 text-emerald-700'
      : tone === 'warn'
        ? 'bg-amber-500/15 text-amber-800'
        : 'bg-[#1E5AA6]/10 text-[#1E5AA6]'
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>{children}</span>
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#1E5AA6]/10 text-[#1E5AA6]">
        <span className="text-xl font-semibold">+</span>
      </div>
      <div className="mt-3 text-base font-semibold">{title}</div>
      <div className="mt-1 text-sm text-slate-600">{description}</div>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  )
}

export function Modal({ open, title, children, onClose }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/30 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="text-sm font-semibold">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm hover:bg-slate-50"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  )
}

