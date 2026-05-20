import { useEffect, useMemo, useState } from 'react'
import { PageShell, SectionCard } from './dashboard/DashboardComponents.jsx'
import { ApplicationTracker } from '../components/ApplicationTracker.jsx'
import { CertificateDownload } from '../components/CertificateDownload.jsx'
import { calculateFeeDetails, defaultPaymentDetails, findApplicationByTrackingId, normalizeStatus } from '../lib/applicationRecords.js'
import { useAppActions, useAppState } from '../state/appStore.jsx'

function TrackApplicationPage({ initialTrackingId = '' }) {
  const { renewals, renewalTypes } = useAppState()
  const { refreshRenewals, fetchRenewalTypes } = useAppActions()
  const [trackingId, setTrackingId] = useState(initialTrackingId)
  const [searched, setSearched] = useState(!!initialTrackingId)

  useEffect(() => {
    if (!searched) return
    refreshRenewals().catch(() => {})
    fetchRenewalTypes().catch(() => {})
  }, [searched, refreshRenewals, fetchRenewalTypes])

  const record = useMemo(
    () => {
      if (!searched) return null
      const normalized = String(trackingId || '').trim().toUpperCase()
      const renewal = (renewals || []).find((item) => String(item.fields?.tracking_id || '').toUpperCase() === normalized)
      if (!renewal) return findApplicationByTrackingId(trackingId)

      const type = (renewalTypes || []).find((item) => item.code === renewal.renewal_type_code)
      const fields = renewal.fields || {}
      const feeDetails = calculateFeeDetails(fields.fee_details || { licenseType: type?.name || renewal.renewal_type_code || '' })

      return {
        id: renewal._id || renewal.id,
        trackingId: fields.tracking_id,
        renewalTypeName: type?.name || renewal.renewal_type_code,
        businessName: fields.business_name || fields.enterprise_name || 'Business',
        registrationNumber: fields.registration_no || fields.udyam_no || '',
        feeDetails,
        paymentDetails: fields.payment_details || defaultPaymentDetails(feeDetails.totalAmount),
        status: normalizeStatus(renewal.status),
        certificateStatus: renewal.status === 'completed' ? 'Ready' : 'Not Ready',
        rejectionReason: (fields.admin_notes || []).at?.(-1)?.note || '',
      }
    },
    [searched, trackingId, renewals, renewalTypes],
  )

  function onSubmit(event) {
    event.preventDefault()
    setSearched(true)
  }

  return (
    <PageShell
      title="Track Application"
      subtitle="Check renewal/update status by Tracking ID"
      right={
        <a
          href="#/dashboard"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Back
        </a>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Search status" description="Enter your Tracking ID to see the latest application stage.">
          <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
            <input
              value={trackingId}
              onChange={(event) => setTrackingId(event.target.value.toUpperCase())}
              placeholder="MSME-2026-ABC123"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <button
              type="submit"
              className="rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-primary-700"
            >
              Track
            </button>
          </form>

          {searched && !record ? (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              No application found for this Tracking ID in your account.
            </div>
          ) : null}
        </SectionCard>

        {record ? (
          <div className="space-y-6">
            <SectionCard title="Application tracking" description={`${record.businessName || 'Business'} - ${record.renewalTypeName || 'Application'}`}>
              <ApplicationTracker record={record} />
            </SectionCard>
            <SectionCard title="Certificate status" description="Download unlocks after approval and payment verification.">
              <CertificateDownload record={record} />
            </SectionCard>
          </div>
        ) : null}
      </div>
    </PageShell>
  )
}

export default TrackApplicationPage
