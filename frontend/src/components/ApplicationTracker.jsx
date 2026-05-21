import { APPLICATION_STATUSES } from '../lib/applicationRecords.js'
import { Pill } from '../pages/renewals/RenewalComponents.jsx'

export function ApplicationTracker({ record, statuses = APPLICATION_STATUSES, fallbackStatus = 'Draft' }) {
  const currentStatus = record?.status || fallbackStatus
  const currentIndex = Math.max(0, statuses.indexOf(currentStatus))

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Tracking ID</div>
          <div className="mt-1 break-all font-mono text-base font-black leading-tight text-slate-900 sm:text-lg">
            {record?.trackingId || 'Not generated'}
          </div>
        </div>
        <div className="shrink-0 self-start">
          <Pill tone={record?.status === 'Rejected' ? 'warn' : record?.status === 'Certificate Ready' ? 'ok' : 'info'}>
            {currentStatus}
          </Pill>
        </div>
      </div>

      <div className="mt-5 h-2 rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-primary-600 to-emerald-500 transition-all"
          style={{ width: `${((currentIndex + 1) / statuses.length) * 100}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(96px,1fr))] gap-2">
        {statuses.map((status, index) => {
          const done = index <= currentIndex
          return (
            <div
              key={status}
              className={[
                'min-h-12 rounded-xl border px-3 py-2 text-center text-xs font-bold leading-snug break-words',
                done ? 'border-primary-100 bg-primary-50 text-primary-800' : 'border-slate-200 bg-slate-50 text-slate-500',
              ].join(' ')}
            >
              {status}
            </div>
          )
        })}
      </div>

      {record?.rejectionReason ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Rejection reason: {record.rejectionReason}
        </div>
      ) : null}
    </div>
  )
}
