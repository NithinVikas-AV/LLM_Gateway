import { useEffect, useState } from 'react'
import { getUsers, deactivateUser, activateUser, getAllUsageSummary } from '../api/users'

export default function Users() {
  const [users, setUsers] = useState([])
  const [usage, setUsage] = useState([])

  const load = () => {
    getUsers().then(r => setUsers(r.data))
    getAllUsageSummary().then(r => setUsage(r.data))
  }
  useEffect(() => { load() }, [])

  const getUsageForUser = (userId) =>
    usage.find(u => u.user_id === userId)

  const handleToggle = async (user) => {
    if (user.is_active) await deactivateUser(user.id)
    else await activateUser(user.id)
    load()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text)]">Users</h1>
        <p className="text-sm text-[var(--text3)] mt-0.5">
          Manage who has access to the app
        </p>
      </div>

      <div className="card">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">User</th>
              <th className="th">Role</th>
              <th className="th">Total calls</th>
              <th className="th">Total cost</th>
              <th className="th">Status</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const u_usage = getUsageForUser(u.id)
              return (
                <tr key={u.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="td">
                    <div className="flex items-center gap-2.5">
                      {u.picture
                        ? <img src={u.picture} className="w-7 h-7 rounded-full" alt="" />
                        : <div className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-xs font-medium">{u.name?.[0]}</div>
                      }
                      <div>
                        <p className="text-sm font-medium text-[var(--text)]">{u.name}</p>
                        <p className="text-xs text-[var(--text3)]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="td">
                    <span className={u.role === 'admin' ? 'badge-purple' : 'badge-blue'}>
                      {u.role}
                    </span>
                  </td>
                  <td className="td text-[var(--text2)]">
                    {u_usage?.total_calls ?? 0}
                  </td>
                  <td className="td text-[var(--text2)]">
                    ${u_usage?.total_cost_usd ?? '0.0000'}
                  </td>
                  <td className="td">
                    <span className={u.is_active ? 'badge-green' : 'badge-red'}>
                      {u.is_active ? 'active' : 'inactive'}
                    </span>
                  </td>
                  <td className="td">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleToggle(u)}
                        className={`text-xs transition-colors ${
                          u.is_active
                            ? 'text-[var(--text3)] hover:text-red-400'
                            : 'text-[var(--text3)] hover:text-green-400'
                        }`}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}