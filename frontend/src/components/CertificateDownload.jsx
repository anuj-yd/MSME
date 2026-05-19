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
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="text-sm font-bold text-slate-900">Certificate</div>
      <div className="mt-4 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-700">
        {buildCertificateText(record || {})}
      </div>

      {!canDownload ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          {message}
        </div>
      ) : null}

      <button
        type="button"
        disabled={!canDownload}
        onClick={() => downloadMockCertificate(record)}
        className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Download Certificate PDF
      </button>
    </div>
  )
}
