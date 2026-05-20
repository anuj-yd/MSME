import { useMemo, useState } from 'react'
import { PageShell, SectionCard } from './dashboard/DashboardComponents.jsx'
import { useAppActions } from '../state/appStore.jsx'

function OtpApprovalPage({ renewalId }) {
  const { submitGovOtp } = useAppActions()
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const canSubmit = useMemo(() => otp.trim().length >= 4 && otp.trim().length <= 8 && !loading, [otp, loading])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      await submitGovOtp(renewalId, otp.trim())
      setMessage('OTP submitted securely. Admin can proceed.')
      setOtp('')
    } catch (e2) {
      const msg =
        e2?.response?.data?.errors?.otp?.[0] ||
        e2?.response?.data?.message ||
        e2.message
      setError(msg || 'Failed to submit OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell
      title="OTP approval"
      subtitle="Enter the OTP you received from the government portal"
      right={
        <a
          href="#/dashboard"
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
        >
          Back
        </a>
      }
    >
      <SectionCard
        title="Enter OTP"
        description="Security: your OTP is encrypted, expires quickly, and can be viewed only once by the requesting admin."
      >
        <form onSubmit={onSubmit} className="max-w-md">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-400">
            OTP
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\s/g, ''))}
              className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-3.5 text-center text-lg font-bold tracking-[0.4em] text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/20"
              inputMode="numeric"
              placeholder="••••"
              required
            />
          </label>

          {error ? (
            <div className="mt-4 rounded-xl border border-rose-200 dark:border-rose-900/35 bg-rose-50 dark:bg-rose-950/20 px-3 py-2 text-sm font-semibold text-rose-700 dark:text-rose-400">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="mt-4 rounded-xl border border-emerald-200 dark:border-emerald-900/35 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2 text-sm font-semibold text-emerald-900 dark:text-emerald-400">
              {message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 dark:bg-white px-4 py-3.5 text-sm font-bold text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-md transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading ? 'Submitting…' : 'Submit OTP'}
          </button>
        </form>
      </SectionCard>
    </PageShell>
  )
}

export default OtpApprovalPage

