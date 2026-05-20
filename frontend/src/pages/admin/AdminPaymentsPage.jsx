import { useEffect, useMemo, useState } from 'react'
import { AdminLayout } from './AdminLayout.jsx'
import { SectionCard, StatCard } from '../dashboard/DashboardComponents.jsx'
import { useAppActions } from '../../state/appStore.jsx'
import { Pill } from '../renewals/RenewalComponents.jsx'
import { normalizeStatus } from '../../lib/applicationRecords.js'

function AdminPaymentsPage() {
  const { adminListPayments } = useAppActions()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refreshPayments() {
    setError('')
    setLoading(true)
    try {
      const data = await adminListPayments()
      setPayments(data)
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    adminListPayments()
      .then((data) => {
        if (mounted) setPayments(data)
      })
      .catch((e) => {
        if (mounted) setError(e?.response?.data?.message || e.message || 'Failed to load payments')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [adminListPayments])

  const stats = useMemo(() => ({
    total: payments.length,
    paid: payments.filter((payment) => payment.status === 'paid').length,
    verified: payments.filter((payment) => payment.status === 'verified').length,
  }), [payments])

  return (
    <AdminLayout title="Payments" subtitle="Check Razorpay payments received from users">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total" value={`${stats.total}`} hint="Recent payments" tone="primary" />
        <StatCard label="Paid" value={`${stats.paid}`} hint="Received via Razorpay" />
        <StatCard label="Verified" value={`${stats.verified}`} hint="Admin verified" tone="warn" />
      </div>

      <div className="mt-6">
        <SectionCard
          title="Payment received"
          description="Open a linked application to verify payment and move user status to Payment Verified."
          actions={
            <button
              type="button"
              onClick={refreshPayments}
              className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              Refresh
            </button>
          }
        >
          {error ? (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-4 text-sm text-slate-300">
              Loading payments...
            </div>
          ) : payments.length ? (
            <div className="overflow-hidden rounded-2xl border border-slate-800">
              <div className="hidden grid-cols-12 gap-3 border-b border-slate-800 bg-slate-950/70 px-4 py-3 text-xs font-semibold text-slate-400 md:grid">
                <div className="col-span-3">User</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-2">Payment</div>
                <div className="col-span-3">Application</div>
                <div className="col-span-2 text-right">Action</div>
              </div>
              <div className="divide-y divide-slate-800">
                {payments.map((payment) => {
                  const linkedRenewalId = payment.renewal?.id || payment.renewal_id
                  return (
                    <div key={payment.id} className="grid gap-3 px-4 py-4 md:grid-cols-12">
                      <div className="min-w-0 md:col-span-3">
                        <div className="truncate text-sm font-semibold text-slate-100">{payment.user?.name || '-'}</div>
                        <div className="mt-0.5 truncate text-xs text-slate-400">{payment.user?.email || '-'}</div>
                      </div>
                      <div className="text-sm font-semibold text-slate-100 md:col-span-2">
                        Rs. {payment.amount_inr || 0}
                        <div className="mt-0.5 text-xs text-slate-500">{payment.currency || 'INR'}</div>
                      </div>
                      <div className="min-w-0 md:col-span-2">
                        <Pill tone={payment.status === 'verified' ? 'ok' : payment.status === 'paid' ? 'info' : 'warn'}>
                          {payment.status || '-'}
                        </Pill>
                        <div className="mt-1 truncate text-xs text-slate-500">{payment.razorpay_payment_id || payment.razorpay_order_id || '-'}</div>
                      </div>
                      <div className="min-w-0 md:col-span-3">
                        <div className="truncate text-sm font-semibold text-slate-100">
                          {payment.renewal?.tracking_id || payment.renewal?.renewal_type_code || payment.purpose}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-400">
                          {payment.renewal ? normalizeStatus(payment.renewal.status) : 'No linked renewal'}
                        </div>
                      </div>
                      <div className="flex items-center md:col-span-2 md:justify-end">
                        {linkedRenewalId ? (
                          <a
                            href={`#/admin/renewals/${encodeURIComponent(linkedRenewalId)}`}
                            className="rounded-xl bg-primary-700 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-600"
                          >
                            Open
                          </a>
                        ) : (
                          <span className="text-xs text-slate-500">Premium payment</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-6 text-center text-sm text-slate-300">
              No payments found.
            </div>
          )}
        </SectionCard>
      </div>
    </AdminLayout>
  )
}

export default AdminPaymentsPage
