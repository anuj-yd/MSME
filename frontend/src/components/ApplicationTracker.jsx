import { APPLICATION_STATUSES } from '../lib/applicationRecords.js'
import { Pill } from '../pages/renewals/RenewalComponents.jsx'

export function ApplicationTracker({ record }) {
  const currentIndex = Math.max(0, APPLICATION_STATUSES.indexOf(record?.status || 'Draft'))

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Tracking ID</div>
          <div className="mt-1 font-mono text-lg font-black text-slate-900">{record?.trackingId || 'Not generated'}</div>
        </div>
        <Pill tone={record?.status === 'Rejected' ? 'warn' : record?.status === 'Certificate Ready' ? 'ok' : 'info'}>
          {record?.status || 'Draft'}
        </Pill>
      </div>

      <div className="mt-5 h-2 rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-primary-600 to-emerald-500 transition-all"
          style={{ width: `${((currentIndex + 1) / APPLICATION_STATUSES.length) * 100}%` }}
        />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {APPLICATION_STATUSES.map((status, index) => {
          const done = index <= currentIndex
          return (
            <div
              key={status}
              className={[
                'rounded-xl border px-3 py-2 text-xs font-bold',
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
