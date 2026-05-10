import { useEffect, useMemo, useState } from 'react'
import { useAppActions } from '../state/appStore.jsx'

function VerifyOtpPage({ email: initialEmail }) {
  const { verifyOtp, resendOtp } = useAppActions()
  const [email, setEmail] = useState(initialEmail || '')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (initialEmail && !email) setEmail(initialEmail)
  }, [initialEmail, email])

  const canVerify = useMemo(
    () => email.trim() && /^[0-9]{4}$/.test(otp) && !loading,
    [email, otp, loading],
  )

  async function onVerify(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      await verifyOtp(email, otp)
      setMessage('Email verified. Redirecting to login…')
      setTimeout(() => {
        window.location.hash = '#/login'
      }, 600)
    } catch (err) {
      const first =
        err?.response?.data?.errors?.otp?.[0] ||
        err?.response?.data?.errors?.email?.[0] ||
        err?.response?.data?.message
      setError(first || err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  async function onResend() {
    setError('')
    setMessage('')
    setResending(true)
    try {
      await resendOtp(email)
      setMessage('OTP sent. Please check your email.')
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to resend OTP')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="relative min-h-dvh flex items-center justify-center bg-slate-50 overflow-hidden text-slate-900">
      {/* Background Decor */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto w-full max-w-[440px] px-6 py-12 z-10">
        <div className="flex justify-center mb-8">
          <a href="#/register" className="group flex items-center gap-3 rounded-xl focus-visible:outline-none">
            <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-800 text-white shadow-xl shadow-primary-500/30 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              <span className="text-lg font-bold tracking-wider">RP</span>
            </div>
          </a>
        </div>

        <div className="rounded-[2rem] border border-white/60 bg-white/70 p-8 shadow-2xl shadow-slate-900/5 backdrop-blur-xl sm:p-10">
          <div className="text-center">
            <div className="mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Verify your email</h1>
            <p className="mt-2 text-sm text-slate-500">Enter the 4-digit OTP sent to your email.</p>
          </div>

          <form onSubmit={onVerify} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-100/50 px-4 py-3 text-sm text-slate-500 outline-none"
                type="email"
                readOnly
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                OTP (4 digits)
              </label>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] text-slate-900 outline-none transition-all focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 placeholder:text-slate-300 placeholder:font-normal"
                inputMode="numeric"
                placeholder="••••"
                required
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                {message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!canVerify}
              className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-primary-500/20 transition-all hover:shadow-lg hover:shadow-primary-500/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? 'Verifying…' : 'Verify Email'}
            </button>

            <button
              type="button"
              onClick={onResend}
              disabled={!email.trim() || resending}
              className="mt-2 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-4 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resending ? 'Sending…' : 'Resend OTP'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Verified already?{' '}
            <a className="font-semibold text-primary-600 transition-colors hover:text-primary-700 hover:underline" href="#/login">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default VerifyOtpPage
