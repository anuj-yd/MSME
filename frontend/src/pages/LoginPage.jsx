import { useMemo, useState } from 'react'
import { useAppActions } from '../state/appStore.jsx'
import { api } from '../lib/apiClient.js'

function LoginPage({ mode = 'user' }) {
  const { login, logout } = useAppActions()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isAdmin = mode === 'admin'

  const canSubmit = useMemo(
    () => email.trim() && password && !loading,
    [email, password, loading],
  )

  const [forgotMode, setForgotMode] = useState(false)
  const [resetStage, setResetStage] = useState(0) // 0 = request, 1 = verify+reset
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState('')
  const [forgotMessage, setForgotMessage] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(email, password)
      if (res?.requiresOtp) {
        window.location.hash = `#/verify?email=${encodeURIComponent(res.email || email)}`
        return
      }
      const role = res?.user?.role || 'user'
      if (isAdmin && role !== 'admin') {
        await logout()
        setError('This account does not have admin access.')
        return
      }
      window.location.hash = role === 'admin' ? '#/admin/dashboard' : '#/dashboard'
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.email?.[0] ||
        err?.response?.data?.errors?.password?.[0] ||
        err.message
      setError(message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function sendResetOtp(e) {
    e?.preventDefault()
    setForgotError('')
    setForgotMessage('')
    setForgotLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setResetStage(1)
      setForgotMessage('If the account exists, a reset OTP has been sent to the email.')
    } catch (err) {
      setForgotError(err?.response?.data?.message || err?.message || 'Failed to request reset')
    } finally {
      setForgotLoading(false)
    }
  }

  async function submitReset(e) {
    e?.preventDefault()
    setForgotError('')
    setForgotMessage('')
    setForgotLoading(true)
    try {
      await api.post('/auth/reset-password', { email, otp, password: newPassword })
      setForgotMessage('Password updated. You can now sign in.')
      setForgotMode(false)
      setResetStage(0)
      setOtp('')
      setNewPassword('')
    } catch (err) {
      setForgotError(err?.response?.data?.message || err?.response?.data?.errors?.otp?.[0] || err?.message || 'Failed to reset password')
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="relative min-h-dvh flex items-center justify-center bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-white transition-colors duration-300">
      {/* Background Decor */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-primary-300/20 dark:bg-primary-950/20 blur-[120px]" />
        <div className="absolute -right-20 bottom-0 h-[500px] w-[500px] rounded-full bg-indigo-400/15 dark:bg-indigo-950/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto w-full max-w-[440px] px-6 py-12 z-10">
        <div className="flex justify-center mb-8">
          <a href="#/" className="group flex items-center gap-3 rounded-xl focus-visible:outline-none">
            <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-800 text-white shadow-xl shadow-primary-500/30 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              <span className="text-lg font-bold tracking-wider">RP</span>
            </div>
          </a>
        </div>

        <div className="rounded-[2rem] border border-white/60 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 p-8 shadow-2xl shadow-slate-900/5 backdrop-blur-xl sm:p-10 transition-all duration-300 hover:border-slate-200 dark:hover:border-slate-700">
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Welcome back</h1>
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              {isAdmin ? 'Sign in to the admin console.' : 'Sign in to your MSE account to continue.'}
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-705 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-primary-500 dark:focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary-500/10 placeholder:text-slate-400 dark:placeholder:text-slate-650"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-705 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 px-4 py-3 pr-12 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-primary-500 dark:focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary-500/10 placeholder:text-slate-400 dark:placeholder:text-slate-650"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center rounded-full px-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-rose-200 dark:border-rose-900/35 bg-rose-50 dark:bg-rose-950/20 px-4 py-3 text-sm font-semibold text-rose-600 dark:text-rose-400">
                {error}
              </div>
            ) : null}

            {!forgotMode ? (
              <div className="text-right">
                <button type="button" onClick={() => setForgotMode(true)} className="text-sm font-bold text-primary-600 dark:text-primary-405 hover:underline">
                  Forgot password?
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {forgotError ? (
                  <div className="rounded-xl border border-rose-200 dark:border-rose-900/35 bg-rose-50 dark:bg-rose-950/20 px-4 py-3 text-sm font-semibold text-rose-600 dark:text-rose-400">
                    {forgotError}
                  </div>
                ) : null}
                {forgotMessage ? (
                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/35 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    {forgotMessage}
                  </div>
                ) : null}

                {resetStage === 0 ? (
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={sendResetOtp} disabled={forgotLoading || !email.trim()} className="mt-2 inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-805 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-805 disabled:opacity-60 transition-colors">
                      {forgotLoading ? 'Sending...' : 'Send reset OTP'}
                    </button>
                    <button type="button" onClick={() => setForgotMode(false)} className="mt-2 inline-flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-bold text-slate-705 dark:text-slate-300 mb-2">OTP</label>
                      <input value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-primary-500" placeholder="1234" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-705 dark:text-slate-300 mb-2">New password</label>
                      <div className="relative">
                        <input
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          type={showNewPassword ? 'text' : 'password'}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 px-4 py-3 pr-12 text-sm text-slate-900 dark:text-white outline-none focus:border-primary-500"
                          placeholder="New password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((prev) => !prev)}
                          className="absolute inset-y-0 right-3 flex items-center rounded-full px-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        >
                          {showNewPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={submitReset} disabled={forgotLoading || !otp || !newPassword} className="mt-2 inline-flex items-center justify-center rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 transition-colors">
                        {forgotLoading ? 'Saving...' : 'Reset password'}
                      </button>
                      <button type="button" onClick={() => { setResetStage(0); setOtp(''); setNewPassword('') }} className="mt-2 inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-805 transition-colors">
                        Back
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-primary-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                isAdmin ? 'Sign in as admin' : 'Sign in'
              )}
            </button>
          </form>

          {isAdmin ? (
            <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Need the user area?{' '}
              <a className="font-semibold text-primary-600 dark:text-primary-400 transition-colors hover:text-primary-700 hover:underline" href="#/login">
                User login
              </a>
            </p>
          ) : (
            <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <a className="font-semibold text-primary-600 dark:text-primary-400 transition-colors hover:text-primary-700 hover:underline" href="#/register">
                Create an account
              </a>
            </p>
          )}
        </div>
        
        <div className="mt-8 text-center">
          <a className="text-sm font-semibold text-slate-500 dark:text-slate-400 transition-colors hover:text-slate-800 dark:hover:text-slate-200" href="#/">
            Back to home
          </a>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
