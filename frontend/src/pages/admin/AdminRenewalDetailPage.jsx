import { useEffect, useMemo, useState } from 'react'
import { SectionCard } from '../dashboard/DashboardComponents.jsx'
import { AdminLayout } from './AdminLayout.jsx'
import { useAppActions } from '../../state/appStore.jsx'
import { Pill } from '../renewals/RenewalComponents.jsx'
import { ApplicationTracker } from '../../components/ApplicationTracker.jsx'
import { CertificateDownload } from '../../components/CertificateDownload.jsx'
import {
  calculateFeeDetails,
  defaultPaymentDetails,
  getApplicationRecord,
  normalizeStatus,
  saveApplicationRecord,
} from '../../lib/applicationRecords.js'
import { notifyLocalApplicationUpdate } from '../../lib/realtime.js'

const ADMIN_TRACKER_STATUSES = [
  'Submitted',
  'Payment Verified',
  'Under Review',
  'Approved',
  'Filed',
  'Certificate Ready',
  'Rejected',
]

function AdminRenewalDetailPage({ id }) {
  const { adminGetRenewal, adminSetRenewalStatus, adminVerifyRenewalPayment } = useAppActions()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [record, setRecord] = useState(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const renewal = data?.renewal
  const docs = data?.documents || []
  const userInfo = useMemo(() => data?.user || record?.user, [data, record])
  const type = useMemo(() => data?.type, [data])

  useEffect(() => {
    let mounted = true
    async function load() {
      setError('')
      setLoading(true)
      try {
        let apiData = null
        try {
          apiData = await adminGetRenewal(id)
        } catch {
          apiData = null
        }

        const localRecord = getApplicationRecord(id)
        const apiRecord = buildRecordFromApi(apiData, id)
        if (mounted) {
          setData(apiData)
          setRecord(apiRecord || localRecord)
          setRejectionReason(localRecord?.rejectionReason || '')
        }
      } catch (e) {
        setError(e?.response?.data?.message || e.message || 'Failed to load case')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [adminGetRenewal, id])

  function patchRecord(patch) {
    const next = saveApplicationRecord({
      ...(record || {}),
      id,
      ...patch,
    })
    setRecord(next)
    return next
  }

  async function setStatus(nextStatus, note = '') {
    setStatusLoading(true)
    try {
      const updated = await adminSetRenewalStatus(id, nextStatus, note)
      if (updated) {
        setData((current) => ({ ...(current || {}), renewal: updated }))
      }
      const normalizedStatus = normalizeStatus(updated?.status || nextStatus)
      patchRecord({
        status: normalizedStatus,
        certificateStatus: normalizedStatus === 'Certificate Ready' ? 'Ready' : record?.certificateStatus || 'Not Ready',
        approvalDate: normalizedStatus === 'Approved' || normalizedStatus === 'Certificate Ready'
          ? record?.approvalDate || new Date().toLocaleDateString()
          : record?.approvalDate,
        rejectionReason: normalizedStatus === 'Rejected' ? note || rejectionReason || 'Application rejected by admin.' : record?.rejectionReason,
      })
      // notify other open tabs/clients that records changed
      try {
        notifyLocalApplicationUpdate()
      } catch {
        // Local cross-tab notification is best-effort.
      }
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to update status')
    } finally {
      setStatusLoading(false)
    }
  }

  async function verifyPayment() {
    setStatusLoading(true)
    try {
      const updated = await adminVerifyRenewalPayment(id)
      if (updated) {
        setData((current) => ({ ...(current || {}), renewal: updated }))
      }
      patchRecord({
        paymentDetails: {
          ...record?.paymentDetails,
          ...(updated?.fields?.payment_details || {}),
          paymentStatus: 'Verified',
        },
        status: normalizeStatus(updated?.status || 'payment_verified'),
      })
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to verify payment')
    } finally {
      setStatusLoading(false)
    }
  }

  function rejectApplication() {
    setStatus('rejected', rejectionReason || 'Application rejected by admin.')
  }

  return (
    <AdminLayout title="Application Details" subtitle={record?.trackingId || id}>
      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-slate-300 shadow-sm">Loading...</div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-900/40 bg-rose-950/20 p-6 text-rose-300">{error}</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <SectionCard title="Application details" description="User, business, fee, and status summary.">
              <div className="grid gap-4 md:grid-cols-2">
                <InfoCard label="User" value={userInfo?.name || '-'} hint={userInfo?.email || '-'} />
                <InfoCard label="Application" value={record?.renewalTypeName || type?.name || renewal?.renewal_type_code || '-'} hint={record?.trackingId || 'No tracking ID'} />
                <InfoCard label="Business name" value={record?.businessName || '-'} hint={record?.registrationNumber || 'No registration number'} />
                <InfoCard label="Enterprise / Type" value={`${record?.enterpriseCategory || '-'} / ${record?.applicationType || '-'}`} hint="Micro/Small and Renewal/Update" />
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div className="text-sm font-semibold">Current status</div>
                <Pill tone={record?.status === 'Rejected' ? 'warn' : 'ok'}>
                  {record?.status || '-'}
                </Pill>
              </div>

              <div className="mt-5">
                <ApplicationTracker record={record} statuses={ADMIN_TRACKER_STATUSES} fallbackStatus="Submitted" />
              </div>
            </SectionCard>

            <SectionCard title="Payment details" description="Verify payment before moving the application forward.">
              <div className="grid gap-3 md:grid-cols-2">
                <InfoCard label="Mode" value={record?.paymentDetails?.mode || '-'} />
                <InfoCard label="Transaction ID / UTR" value={record?.paymentDetails?.transactionId || '-'} />
                <InfoCard label="Payment date" value={record?.paymentDetails?.paymentDate || '-'} />
                <InfoCard label="Amount paid" value={`Rs. ${record?.paymentDetails?.amountPaid || 0}`} />
                <InfoCard label="Payment status" value={record?.paymentDetails?.paymentStatus || '-'} />
                <InfoCard label="Receipt" value={record?.paymentDetails?.receiptFile || 'Not uploaded'} />
              </div>
              <button
                type="button"
                onClick={verifyPayment}
                disabled={statusLoading || record?.paymentDetails?.paymentStatus === 'Verified'}
                className="mt-4 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {record?.paymentDetails?.paymentStatus === 'Verified' ? 'Payment Verified' : 'Verify Payment'}
              </button>
            </SectionCard>

            <SectionCard title="Documents" description="Open uploaded documents for review.">
              {docs.length ? (
                <div className="space-y-3">
                  {docs.map((d) => (
                    <div key={d._id || d.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-100">{d.original_name}</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {(d.tags || []).map((t) => (
                            <span key={t} className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      {d.imagekit_url ? (
                        <a href={d.imagekit_url} target="_blank" rel="noreferrer" className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                          Open
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500">No URL</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-4 text-sm text-slate-300">
                  No documents attached or backend document API unavailable.
                </div>
              )}
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard title="Admin actions" description="Move application through required status stages.">
              <div className="grid gap-2">
                <button type="button" disabled={statusLoading} onClick={() => setStatus('in_review')} className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-60">
                  Mark Under Process
                </button>
                <button type="button" disabled={statusLoading} onClick={() => setStatus('payment_verified')} className="rounded-xl border border-emerald-900/40 bg-emerald-950/30 px-3 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-950/50 disabled:opacity-60">
                  Mark Payment Verified
                </button>
                <button type="button" disabled={statusLoading} onClick={() => setStatus('approved')} className="rounded-xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60">
                  Approve
                </button>
                <button type="button" disabled={statusLoading} onClick={() => setStatus('filed')} className="rounded-xl bg-primary-700 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-60">
                  Mark Filed
                </button>
                <button type="button" disabled={statusLoading} onClick={() => setStatus('completed')} className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
                  Mark Certificate Ready
                </button>
              </div>

              <div className="mt-5">
                <label className="text-sm font-semibold text-slate-300">
                  Rejection reason
                  <textarea
                    value={rejectionReason}
                    onChange={(event) => setRejectionReason(event.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </label>
                <button
                  type="button"
                  onClick={rejectApplication}
                  className="mt-3 w-full rounded-xl bg-rose-700 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-600"
                >
                  Reject Application
                </button>
              </div>
            </SectionCard>

            <SectionCard title="Fee details" description="Base Fee + Late Fee = Total Amount">
              <div className="space-y-3 text-sm">
                <AmountRow label="Base Fee" value={record?.feeDetails?.baseFee || 0} />
                <AmountRow label="Late Fee" value={record?.feeDetails?.lateFee || 0} />
                <AmountRow label="Total Amount" value={record?.feeDetails?.totalAmount || 0} strong />
              </div>
            </SectionCard>

            <SectionCard title="Certificate preview" description="Admin can verify when download will unlock.">
              <CertificateDownload record={record} />
            </SectionCard>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

function buildRecordFromApi(data, id) {
  if (!data?.renewal) return null
  const fields = data.renewal.fields || {}
  const feeDetails = calculateFeeDetails(fields.fee_details || { licenseType: data.type?.name || data.renewal.renewal_type_code || '' })
  return {
    id,
    renewalTypeCode: data.renewal.renewal_type_code || '',
    renewalTypeName: data.type?.name || data.renewal.renewal_type_code || '',
    businessName: fields.business_name || fields.enterprise_name || '',
    registrationNumber: fields.registration_no || fields.udyam_no || '',
    enterpriseCategory: feeDetails.enterpriseCategory,
    applicationType: feeDetails.applicationType,
    feeDetails,
    paymentDetails: fields.payment_details || defaultPaymentDetails(feeDetails.totalAmount),
    status: normalizeStatus(data.renewal.status),
    certificateStatus: 'Not Ready',
    trackingId: fields.tracking_id,
    submittedAt: data.renewal.submitted_at,
    user: data.user ? { id: data.user.id || data.user._id || '', name: data.user.name || '', email: data.user.email || '' } : null,
  }
}

function InfoCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-100">{value}</div>
      {hint ? <div className="mt-0.5 text-xs text-slate-400">{hint}</div> : null}
    </div>
  )
}

function AmountRow({ label, value, strong = false }) {
  return (
    <div className={`flex items-center justify-between text-slate-300 ${strong ? 'border-t border-slate-800 pt-3 font-black text-white' : ''}`}>
      <span>{label}</span>
      <span>Rs. {value}</span>
    </div>
  )
}

export default AdminRenewalDetailPage
