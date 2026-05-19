import { useEffect, useState } from 'react'
import { AdminLayout } from './AdminLayout.jsx'
import { SectionCard, StatCard } from '../dashboard/DashboardComponents.jsx'
import { useAppActions } from '../../state/appStore.jsx'
import { readApplicationRecords } from '../../lib/applicationRecords.js'

export default function AdminDashboardPage() {
  const { adminGetStats } = useAppActions()
  const [stats, setStats] = useState(null)
  const [localStats, setLocalStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const data = await adminGetStats()
        if (mounted) setStats(data)
      } catch (e) {
        if (mounted) setError('Failed to load dashboard stats.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [adminGetStats])

  useEffect(() => {
    function syncLocalStats() {
      const records = readApplicationRecords()
      setLocalStats({
        total: records.length,
        pendingReview: records.filter((item) => item.status === 'Submitted' || item.status === 'Under Review').length,
        paymentPending: records.filter((item) => item.status === 'Payment Pending').length,
        approved: records.filter((item) => item.status === 'Approved').length,
        rejected: records.filter((item) => item.status === 'Rejected').length,
        certificateReady: records.filter((item) => item.status === 'Certificate Ready').length,
      })
    }

    syncLocalStats()
    window.addEventListener('application-records-change', syncLocalStats)
    return () => window.removeEventListener('application-records-change', syncLocalStats)
  }, [])

  return (
    <AdminLayout title="Admin • Dashboard">
      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white/50 px-6 py-10 text-center text-sm font-medium text-slate-500 backdrop-blur-sm">
          Loading dashboard metrics...
        </div>
      ) : stats ? (
        <div className="space-y-6">
          <SectionCard title="Application workflow stats" description="Tracking, payment, and certificate workflow.">
            <div className="grid gap-4 md:grid-cols-3 mt-4">
              <StatCard label="Total Applications" value={localStats?.total || 0} tone="primary" />
              <StatCard label="Pending Review" value={localStats?.pendingReview || 0} />
              <StatCard label="Payment Pending" value={localStats?.paymentPending || 0} tone="warn" />
              <StatCard label="Approved" value={localStats?.approved || 0} />
              <StatCard label="Rejected" value={localStats?.rejected || 0} tone="warn" />
              <StatCard label="Certificate Ready" value={localStats?.certificateReady || 0} />
            </div>
          </SectionCard>

          <SectionCard title="System Overview" description="High-level metrics of the MSME platform.">
            <div className="grid gap-4 md:grid-cols-3 mt-4">
              <StatCard label="Total Users" value={stats.total_users || 0} tone="primary" />
              <StatCard label="Premium Users" value={stats.premium_users || 0} />
              <StatCard label="Total Applications" value={stats.total_applications || 0} />
            </div>
          </SectionCard>

          <SectionCard title="Applications by Status" description="Current distribution of all renewal applications.">
            <div className="grid gap-4 md:grid-cols-4 mt-4">
              <StatCard 
                label="Submitted" 
                value={stats.applications_by_status?.submitted || 0} 
                hint="Waiting for admin review" 
                tone="primary" 
              />
              <StatCard 
                label="OTP Required" 
                value={stats.applications_by_status?.otp_required || 0} 
                hint="Waiting for user OTP" 
                tone="warn" 
              />
              <StatCard 
                label="In Review" 
                value={stats.applications_by_status?.in_review || 0} 
                hint="Processing by admin" 
              />
              <StatCard 
                label="Completed" 
                value={stats.applications_by_status?.completed || 0} 
                hint="Successfully filed" 
              />
            </div>
          </SectionCard>
        </div>
      ) : null}
    </AdminLayout>
  )
}
