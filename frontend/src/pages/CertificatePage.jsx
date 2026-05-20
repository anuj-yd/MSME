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
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
        >
          Back
        </a>
      }
    >
      <SectionCard title="Certificate page" description="Certificate becomes downloadable after approval, verified payment, and ready status.">
        {record ? (
          <CertificateDownload record={record} />
        ) : (
          <div className="rounded-xl border border-rose-200 dark:border-rose-900/35 bg-rose-50 dark:bg-rose-950/20 px-4 py-3 text-sm font-semibold text-rose-700 dark:text-rose-400">
            Application record not found on this browser.
          </div>
        )}
      </SectionCard>
    </PageShell>
  )
}

export default CertificatePage
