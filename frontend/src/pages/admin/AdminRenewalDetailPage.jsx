import { useEffect, useMemo, useState } from 'react'
import { PageShell, SectionCard } from '../dashboard/DashboardComponents.jsx'
import { useAppActions, useAppState } from '../../state/appStore.jsx'
import { Pill } from '../renewals/RenewalComponents.jsx'

function AdminRenewalDetailPage({ id }) {
  const { user } = useAppState()
  const { adminGetRenewal, adminSetRenewalStatus, adminRequestOtp, adminGetOtp } = useAppActions()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpValue, setOtpValue] = useState('')
  const [otpStatus, setOtpStatus] = useState('')

  const renewal = data?.renewal
  const docs = data?.documents || []

  useEffect(() => {
    let mounted = true
    async function load() {
      setError('')
      setLoading(true)
      try {
        const res = await adminGetRenewal(id)
        if (mounted) setData(res)
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

  const userInfo = useMemo(() => data?.user, [data])
  const type = useMemo(() => data?.type, [data])

  async function setStatus(next) {
    setStatusLoading(true)
    try {
      await adminSetRenewalStatus(id, next)
      const res = await adminGetRenewal(id)
      setData(res)
    } finally {
      setStatusLoading(false)
    }
  }

  async function requestOtp() {
    setOtpLoading(true)
    setOtpValue('')
    setOtpStatus('')
    try {
      await adminRequestOtp(id, 'OTP required for government portal step')
      setOtpStatus('requested')
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to request OTP')
    } finally {
      setOtpLoading(false)
    }
  }

  async function fetchOtp() {
    setOtpLoading(true)
    setOtpValue('')
    try {
      const res = await adminGetOtp(id)
      setOtpStatus(res.status || '')
      if (res.otp) setOtpValue(res.otp)
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to get OTP')
    } finally {
      setOtpLoading(false)
    }
  }

  return (
    <PageShell
      title="Admin • Case"
      subtitle={`Signed in as ${user?.email || 'admin'}`}
      right={
        <a
          href="#/admin/renewals"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Back to inbox
        </a>
      }
    >
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">Loading…</div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <SectionCard title="Case details" description="User + renewal summary.">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs text-slate-600">User</div>
                  <div className="mt-1 text-sm font-semibold">{userInfo?.name}</div>
                  <div className="mt-0.5 text-xs text-slate-600">{userInfo?.email}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs text-slate-600">Renewal type</div>
                  <div className="mt-1 text-sm font-semibold">{type?.name || renewal?.renewal_type_code}</div>
                  <div className="mt-0.5 text-xs text-slate-600">{renewal?.renewal_type_code}</div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm font-semibold">Status</div>
                <Pill tone={renewal?.status === 'submitted' ? 'info' : renewal?.status === 'otp_required' ? 'warn' : 'ok'}>
                  {renewal?.status}
                </Pill>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  disabled={statusLoading}
                  onClick={() => setStatus('in_review')}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
                >
                  Mark in_review
                </button>
                <button
                  disabled={statusLoading}
                  onClick={() => setStatus('filed')}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
                >
                  Mark filed
                </button>
                <button
                  disabled={statusLoading}
                  onClick={() => setStatus('completed')}
                  className="rounded-xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
                >
                  Complete
                </button>
                <button
                  disabled={statusLoading}
                  onClick={() => setStatus('rejected')}
                  className="rounded-xl bg-rose-700 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            </SectionCard>

            <SectionCard title="Documents" description="Open ImageKit URLs for filing on govt portal.">
              {docs.length ? (
                <div className="space-y-3">
                  {docs.map((d) => (
                    <div key={d._id || d.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{d.original_name}</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {(d.tags || []).map((t) => (
                            <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      {d.imagekit_url ? (
                        <a
                          href={d.imagekit_url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                          Open
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500">No URL</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                  No documents attached.
                </div>
              )}
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard title="OTP step" description="Request OTP from user, view it once, and proceed.">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Security: OTP is encrypted, expires in 5 minutes, and can be viewed only once by the requesting admin.
              </div>

              <div className="mt-4 grid gap-2">
                <button
                  disabled={otpLoading}
                  onClick={requestOtp}
                  className="rounded-xl bg-[#1E5AA6] px-3 py-2 text-sm font-semibold text-white hover:bg-[#184D8E] disabled:opacity-60"
                >
                  Request OTP
                </button>
                <button
                  disabled={otpLoading}
                  onClick={fetchOtp}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
                >
                  Check / Reveal OTP
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs text-slate-600">OTP status</div>
                <div className="mt-1 text-sm font-semibold">{otpStatus || '—'}</div>
                <div className="mt-3 text-xs text-slate-600">OTP (visible once)</div>
                <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-lg tracking-[0.4em]">
                  {otpValue ? otpValue : '••••'}
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      )}
    </PageShell>
  )
}

export default AdminRenewalDetailPage

