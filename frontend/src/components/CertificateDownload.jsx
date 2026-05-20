import { buildCertificateText, downloadMockCertificate } from '../lib/applicationRecords.js'

export function CertificateDownload({ record }) {
  const paymentReady = record?.paymentDetails?.paymentStatus === 'Verified' || record?.paymentDetails?.paymentStatus === 'Paid'
  const approved = record?.status === 'Approved' || record?.status === 'Certificate Ready'
  const certificateReady = record?.certificateStatus === 'Ready' || record?.status === 'Certificate Ready'
  const canDownload = approved && paymentReady && certificateReady

  let message = ''
  if (!approved) message = 'Application approval pending.'
  else if (!paymentReady) message = 'Payment verification pending. Certificate download available after approval.'
  else if (!certificateReady) message = 'Certificate is not ready yet.'

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5">
      <div className="text-sm font-bold text-slate-900 dark:text-white">Certificate</div>
      <div className="mt-4 whitespace-pre-wrap rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 font-mono text-xs text-slate-750 dark:text-slate-300">
        {buildCertificateText(record || {})}
      </div>

      {!canDownload ? (
        <div className="mt-4 rounded-xl border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-sm font-semibold text-amber-900 dark:text-amber-400">
          {message}
        </div>
      ) : null}

      <button
        type="button"
        disabled={!canDownload}
        onClick={() => downloadMockCertificate(record)}
        className="mt-4 w-full rounded-xl bg-slate-900 dark:bg-white px-4 py-3 text-sm font-bold text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
      >
        Download Certificate PDF
      </button>
    </div>
  )
}
