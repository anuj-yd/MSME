import { useMemo, useState } from 'react'
import { useAppActions } from '../state/appStore.jsx'

function RegisterPage() {
  const { register } = useAppActions()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const canSubmit = useMemo(
    () => name.trim() && email.trim() && password.length >= 6 && !loading,
    [name, email, password, loading],
  )

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await register(name, email, password)
      window.location.hash = `#/verify?email=${encodeURIComponent(res.email || email)}`
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-dvh flex items-center justify-center bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-white transition-colors duration-300">
      {/* Background Decor */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-indigo-300/20 dark:bg-indigo-950/20 blur-[120px]" />
        <div className="absolute -left-20 bottom-0 h-[500px] w-[500px] rounded-full bg-primary-400/15 dark:bg-primary-950/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto w-full max-w-[480px] px-6 py-12 z-10">
        <div className="flex justify-center mb-8">
          <a href="#/" className="group flex items-center gap-3 rounded-xl focus-visible:outline-none">
            <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-800 text-white shadow-xl shadow-primary-500/30 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
              <span className="text-lg font-bold tracking-wider">RP</span>
            </div>
          </a>
        </div>

        <div className="rounded-[2rem] border border-white/60 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 p-8 shadow-2xl shadow-slate-900/5 backdrop-blur-xl sm:p-10 transition-all duration-300 hover:border-slate-200 dark:hover:border-slate-700">
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Create your account</h1>
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">We'll send a 4-digit OTP to verify your email.</p>
          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-705 dark:text-slate-300 mb-2">
                Full Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-primary-500 dark:focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary-500/10 placeholder:text-slate-400 dark:placeholder:text-slate-655"
                placeholder="John Doe"
                autoComplete="name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-705 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-primary-500 dark:focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary-500/10 placeholder:text-slate-400 dark:placeholder:text-slate-655"
                placeholder="john@company.com"
                type="email"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-705 dark:text-slate-300 mb-2">
                Password
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition-all focus:border-primary-500 dark:focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary-500/10 placeholder:text-slate-400 dark:placeholder:text-slate-655"
                placeholder="Min 6 characters"
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-rose-200 dark:border-rose-900/35 bg-rose-50 dark:bg-rose-950/20 px-4 py-3 text-sm font-semibold text-rose-600 dark:text-rose-400">
                {error}
              </div>
            ) : null}

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
                  Sending OTP...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <a className="font-semibold text-primary-600 dark:text-primary-400 transition-colors hover:text-primary-700 hover:underline" href="#/login">
              Sign in
            </a>
          </p>
        </div>
        
        <div className="mt-8 text-center">
          <a className="text-sm font-semibold text-slate-500 dark:text-slate-400 transition-colors hover:text-slate-800 dark:hover:text-slate-200" href="#/">
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
