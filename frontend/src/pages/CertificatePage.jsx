import { useMemo } from 'react'
import { PageShell, SectionCard } from './dashboard/DashboardComponents.jsx'
import { CertificateDownload } from '../components/CertificateDownload.jsx'
import { getApplicationRecord } from '../lib/applicationRecords.js'

function CertificatePage({ id }) {
  const record = useMemo(() => getApplicationRecord(id), [id])

  return (
    <PageShell
      title="Certificate Download"
      subtitle="Renewal Portal for MSEs"
      right={
        <a
          href="#/renewals"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Back
        </a>
      }
    >
      <SectionCard title="Certificate page" description="Certificate becomes downloadable after approval, verified payment, and ready status.">
        {record ? (
          <CertificateDownload record={record} />
        ) : (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Application record not found on this browser.
          </div>
        )}
      </SectionCard>
    </PageShell>
  )
}

export default CertificatePage
