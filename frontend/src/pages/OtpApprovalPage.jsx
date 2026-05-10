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
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
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
          <label className="block text-sm font-medium text-slate-700">
            OTP
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\s/g, ''))}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-lg tracking-[0.4em] outline-none focus:ring-2 focus:ring-[#1E5AA6]/30"
              inputMode="numeric"
              placeholder="••••"
              required
            />
          </label>

          {error ? (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              {message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#1E5AA6] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#184D8E] disabled:opacity-60"
          >
            {loading ? 'Submitting…' : 'Submit OTP'}
          </button>
        </form>
      </SectionCard>
    </PageShell>
  )
}

export default OtpApprovalPage

