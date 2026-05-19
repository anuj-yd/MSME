import { useEffect, useState } from 'react'
import { AdminLayout } from './AdminLayout.jsx'
import { SectionCard } from '../dashboard/DashboardComponents.jsx'
import { useAppActions, useAppState } from '../../state/appStore.jsx'
import { Pill } from '../renewals/RenewalComponents.jsx'

export default function AdminUsersPage() {
  const { user: currentUser } = useAppState()
  const { adminListUsers, adminUpdateUserRole } = useAppActions()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const data = await adminListUsers()
        if (mounted) setUsers(data)
      } catch (e) {
        if (mounted) setError('Failed to load users.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [adminListUsers])

  async function handleRoleChange(userId, newRole) {
    if (updating) return
    setUpdating(userId)
    try {
      const updatedUser = await adminUpdateUserRole(userId, newRole)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: updatedUser.role } : u))
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to update role')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <AdminLayout title="Admin • Users" subtitle="Manage registered users and roles">
      <SectionCard 
        title="All Users" 
        description="View and manage users registered on the platform. Admins can promote other users to admin."
      >
        {error ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-700">
            Loading users...
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <div className="grid grid-cols-12 gap-3 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700 border-b border-slate-200">
              <div className="col-span-4">User Details</div>
              <div className="col-span-3">Joined Date</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>
            <div className="divide-y divide-slate-200">
              {users.map((u) => (
                <div key={u.id} className="grid grid-cols-12 gap-3 px-4 py-4 items-center bg-white hover:bg-slate-50 transition-colors">
                  <div className="col-span-4 min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">{u.name}</div>
                    <div className="mt-0.5 truncate text-xs text-slate-500">{u.email}</div>
                  </div>
                  <div className="col-span-3 text-xs text-slate-600">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                  </div>
                  <div className="col-span-2">
                    <Pill tone={u.role === 'admin' ? 'info' : 'default'}>
                      {u.role === 'admin' ? 'Admin' : 'User'}
                    </Pill>
                  </div>
                  <div className="col-span-3 flex items-center justify-end">
                    {currentUser?.id !== u.id && (
                      <select
                        value={u.role || 'user'}
                        disabled={updating === u.id}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
                      >
                        <option value="user">Make User</option>
                        <option value="admin">Make Admin</option>
                      </select>
                    )}
                    {currentUser?.id === u.id && (
                      <span className="text-xs text-slate-400 italic">It's you</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-700">
            No users found.
          </div>
        )}
      </SectionCard>
    </AdminLayout>
  )
}
