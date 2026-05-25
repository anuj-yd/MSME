import { useMemo, useRef, useState } from 'react'
import { LanguageSelect } from '../../components/GoogleTranslate.jsx'

export function PageShell({ title, subtitle, right, children }) {
  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900 relative overflow-hidden">
      {/* Background Decor */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-20 top-0 h-[400px] w-[400px] rounded-full bg-primary-200/20 blur-[100px]" />
        <div className="absolute -right-20 bottom-40 h-[500px] w-[500px] rounded-full bg-indigo-300/15 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/40 bg-white/60 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-primary-600 to-indigo-800 text-white shadow-md shadow-primary-500/20">
              <span className="text-sm font-bold tracking-wider">RP</span>
            </div>
            <div className="min-w-0">
              <div className="truncate text-lg font-bold tracking-tight text-slate-900">{title}</div>
              {subtitle ? (
                <div className="truncate text-xs font-medium text-slate-500 uppercase tracking-widest">{subtitle}</div>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <PreferenceControls />
            {right}
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
    </div>
  )
}

function PreferenceControls() {
  return (
    <div className="flex items-center gap-2">
      <LanguageSelect compact />
    </div>
  )
}

export function StatCard({ label, value, hint, tone = 'default' }) {
  const toneClass =
    tone === 'primary'
      ? 'border-primary-100 bg-gradient-to-br from-primary-50 to-white text-primary-900'
      : tone === 'warn'
        ? 'border-amber-100 bg-gradient-to-br from-amber-50 to-white text-amber-900'
        : 'border-white/60 bg-white/70'

  return (
    <div className={`rounded-3xl border p-6 shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-md ${toneClass}`}>
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-3 text-4xl font-extrabold tracking-tight">{value}</div>
      {hint ? <div className="mt-2 text-xs font-medium text-slate-500">{hint}</div> : null}
    </div>
  )
}

export function SectionCard({ title, description, actions, children }) {
  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/70 p-8 shadow-sm backdrop-blur-xl transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      <div>{children}</div>
    </section>
  )
}

export function LockedPanel({ locked, label = 'Premium', children }) {
  if (!locked) return <>{children}</>

  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/40 backdrop-blur-sm">
      <div className="pointer-events-none select-none blur-md opacity-40">{children}</div>
      <div className="absolute inset-0 grid place-items-center bg-white/20 p-6 backdrop-blur-md">
        <div className="w-full max-w-sm rounded-[2rem] border border-white/80 bg-white/90 p-8 text-center shadow-xl">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/30">
            <span className="text-xl font-semibold">★</span>
          </div>
          <div className="mt-4 text-lg font-bold text-slate-900">{label} Feature</div>
          <div className="mt-2 text-sm text-slate-600 leading-relaxed">
            Unlock full access to download renewals and view complete application details.
          </div>
          <a
            href="#/pricing"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:scale-105"
          >
            Upgrade Now
          </a>
        </div>
      </div>
    </div>
  )
}

export function PremiumBlur({ locked, children }) {
  if (!locked) return <>{children}</>
  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/40 backdrop-blur-sm">
      <div className="select-none blur-md opacity-40">{children}</div>
      <div className="absolute inset-0 grid place-items-center bg-white/20 p-6 backdrop-blur-md">
        <div className="w-full max-w-sm rounded-[2rem] border border-white/80 bg-white/90 p-8 text-center shadow-xl">
          <div className="text-sm font-bold uppercase tracking-wider text-rose-500 mb-2">Locked Section</div>
          <div className="text-sm text-slate-600 leading-relaxed">
            Upgrade to Premium to unlock full download capabilities.
          </div>
          <a
            href="#/pricing"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:scale-105"
          >
            Unlock Premium
          </a>
        </div>
      </div>
    </div>
  )
}

export function DragAndDropUpload({ label = 'Upload documents', onFiles }) {
  const inputRef = useRef(null)
  const [active, setActive] = useState(false)
  const accept = useMemo(() => ['.pdf', '.png', '.jpg', '.jpeg'], [])

  function pick() {
    inputRef.current?.click()
  }

  function handleFiles(fileList) {
    const files = Array.from(fileList || [])
    if (!files.length) return
    onFiles?.(files)
  }

  function onDrop(e) {
    e.preventDefault()
    setActive(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="text-sm font-bold text-slate-800">{label}</div>
        <button
          type="button"
          onClick={pick}
          className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:-translate-y-0.5"
        >
          Browse Files
        </button>
      </div>

      <div
        onDragEnter={(e) => {
          e.preventDefault()
          setActive(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setActive(true)
        }}
        onDragLeave={() => setActive(false)}
        onDrop={onDrop}
        className={[
          'rounded-3xl border-2 border-dashed p-10 transition-all duration-300',
          active
            ? 'border-primary-500 bg-primary-50/50 scale-[1.02]'
            : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50',
        ].join(' ')}
      >
        <div className="flex flex-col items-center text-center">
          <div className="grid size-14 place-items-center rounded-full bg-white text-primary-600 shadow-md">
            <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <div className="mt-4 text-base font-bold text-slate-900">
            Drag &amp; drop files here
          </div>
          <div className="mt-1 text-sm font-medium text-slate-500">
            Supported: {accept.join(', ')} (max 10MB each)
          </div>
          <button
            type="button"
            onClick={pick}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-primary-500/20 transition-all hover:scale-105"
          >
            Select Files
          </button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept.join(',')}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
