import { useEffect, useState } from 'react'
import { useAppActions, useAppState } from '../../state/appStore.jsx'

export function AdminAuthGate({ children }) {
  const { authToken, user } = useAppState()
  const { refreshMe, logout } = useAppActions()
  const [checking, setChecking] = useState(!!authToken && !user)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function checkAccess() {
      if (!authToken) {
        window.location.hash = '#/admin/login'
        return
      }

      if (user) {
        if (user.role !== 'admin') window.location.hash = '#/dashboard'
        return
      }

      setChecking(true)
      setError('')
      try {
        const freshUser = await refreshMe()
        if (!mounted) return
        if (freshUser?.role !== 'admin') {
          await logout()
          window.location.hash = '#/admin/login'
        }
      } catch (e) {
        if (!mounted) return
        setError(e?.response?.data?.message || e.message || 'Admin session expired.')
        await logout()
      } finally {
        if (mounted) setChecking(false)
      }
    }

    checkAccess()
    return () => {
      mounted = false
    }
  }, [authToken, user, refreshMe, logout])

  if (!authToken) return null

  if (checking) {
    return (
      <div className="grid min-h-dvh place-items-center bg-slate-50 px-6 text-center">
        <div>
          <div className="text-sm font-bold uppercase tracking-widest text-primary-600">Admin</div>
          <div className="mt-3 text-lg font-semibold text-slate-900">Checking access...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid min-h-dvh place-items-center bg-slate-50 px-6 text-center">
        <div className="max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-rose-700">{error}</div>
          <a
            href="#/admin/login"
            className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white"
          >
            Admin login
          </a>
        </div>
      </div>
    )
  }

  if (user?.role !== 'admin') return null

  return children
}
