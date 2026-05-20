import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import VerifyOtpPage from './pages/VerifyOtpPage.jsx'
import UserDashboardPage from './pages/UserDashboardPage.jsx'
import PricingPage from './pages/PricingPage.jsx'
import RenewalsPage from './pages/RenewalsPage.jsx'
import RenewalDetailPage from './pages/RenewalDetailPage.jsx'
import DocumentsPage from './pages/DocumentsPage.jsx'
import SmartAssistant from './pages/SmartAssistant.jsx'
import TrackApplicationPage from './pages/TrackApplicationPage.jsx'
import CertificatePage from './pages/CertificatePage.jsx'
import AdminRenewalsPage from './pages/admin/AdminRenewalsPage.jsx'
import AdminRenewalDetailPage from './pages/admin/AdminRenewalDetailPage.jsx'
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx'
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx'
import { AdminAuthGate } from './pages/admin/AdminAuthGate.jsx'
import OtpApprovalPage from './pages/OtpApprovalPage.jsx'
import { useEffect, useState } from 'react'
import { GoogleTranslateElement } from './components/GoogleTranslate.jsx'

function getRoute() {
  const raw = window.location.hash || '#/'
  const path = raw.startsWith('#') ? raw.slice(1) : raw
  const normalized = path === '' ? '/' : path
  const [pathname, queryString = ''] = normalized.split('?')

  const params = new URLSearchParams(queryString)

  return { pathname, params }
}

function GlobalLoader() {
  const [apiLoading, setApiLoading] = useState(false)
  const [forceLoading, setForceLoading] = useState(false)

  useEffect(() => {
    function handle(e) {
      setApiLoading(e.detail)
    }
    function handleForce(e) {
      setForceLoading(e.detail)
    }
    window.addEventListener('global-loader', handle)
    window.addEventListener('global-loader-force', handleForce)
    return () => {
      window.removeEventListener('global-loader', handle)
      window.removeEventListener('global-loader-force', handleForce)
    }
  }, [])

  if (!apiLoading && !forceLoading) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/40 backdrop-blur-md">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex size-16 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200/50"></div>
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary-600 border-t-transparent border-l-transparent"></div>
          <span className="text-xs font-bold text-primary-700 tracking-wider animate-pulse">RP</span>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [route, setRoute] = useState(getRoute)

  useEffect(() => {
    function onChange() {
      setRoute(getRoute())
      window.dispatchEvent(new CustomEvent('global-loader-force', { detail: true }))
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('global-loader-force', { detail: false }))
      }, 400)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const { pathname, params } = route

  let page = <LandingPage />
  if (pathname === '/login') page = <LoginPage />
  else if (pathname === '/admin/login') page = <LoginPage mode="admin" />
  else if (pathname === '/register') page = <RegisterPage />
  else if (pathname === '/verify') page = <VerifyOtpPage email={params.get('email') || ''} />
  else if (pathname === '/dashboard') page = <UserDashboardPage />
  else if (pathname === '/pricing') page = <PricingPage />
  else if (pathname === '/renewals') page = <RenewalsPage />
  else if (pathname === '/documents') page = <DocumentsPage />
  else if (pathname === '/smart-assistant') page = <SmartAssistant />
  else if (pathname === '/track') page = <TrackApplicationPage initialTrackingId={params.get('trackingId') || ''} />
  else if (pathname.startsWith('/certificate/')) {
    const id = decodeURIComponent(pathname.replace('/certificate/', ''))
    page = <CertificatePage id={id} />
  }
  else if (pathname === '/admin' || pathname === '/admin/dashboard') page = <AdminAuthGate><AdminDashboardPage /></AdminAuthGate>
  else if (pathname === '/admin/users') page = <AdminAuthGate><AdminUsersPage /></AdminAuthGate>
  else if (pathname === '/admin/renewals') page = <AdminAuthGate><AdminRenewalsPage /></AdminAuthGate>
  else if (pathname.startsWith('/admin/renewals/')) {
    const id = decodeURIComponent(pathname.replace('/admin/renewals/', ''))
    page = <AdminAuthGate><AdminRenewalDetailPage id={id} /></AdminAuthGate>
  } else if (pathname.startsWith('/otp/')) {
    const id = decodeURIComponent(pathname.replace('/otp/', ''))
    page = <OtpApprovalPage renewalId={id} />
  } else if (pathname.startsWith('/renewals/')) {
    const id = decodeURIComponent(pathname.replace('/renewals/', ''))
    page = <RenewalDetailPage id={id} />
  }

  return (
    <>
      <GoogleTranslateElement />
      <GlobalLoader />
      {page}
    </>
  )
}

export default App
