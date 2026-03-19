import { useEffect, useState } from 'react'
import { getUsers, updateRole, deactivateUser } from '../api/users'

export default function Users() {
  const [users, setUsers] = useState([])
  const load = () => getUsers().then(r => setUsers(r.data))
  useEffect(() => { load() }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text)]">Users</h1>
        <p className="text-sm text-[var(--text3)] mt-0.5">Manage roles and access for your team</p>
      </div>

      <div className="card">
        <table className="w-full">
          <thead><tr>
            <th className="th">User</th>
            <th className="th">Role</th>
            <th className="th">Status</th>
            <th className="th">Actions</th>
          </tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
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
                  <span className={u.role === 'admin' ? 'badge-purple' : 'badge-blue'}>{u.role}</span>
                </td>
                <td className="td">
                  <span className={u.is_active ? 'badge-green' : 'badge-red'}>
                    {u.is_active ? 'active' : 'inactive'}
                  </span>
                </td>
                <td className="td">
                  <div className="flex gap-2">
                    <button
                      onClick={() => { updateRole(u.id, u.role === 'admin' ? 'employee' : 'admin').then(load) }}
                      className="text-xs btn-ghost py-1 px-2"
                    >
                      Make {u.role === 'admin' ? 'employee' : 'admin'}
                    </button>
                    {u.is_active && (
                      <button
                        onClick={() => { deactivateUser(u.id).then(load) }}
                        className="text-xs text-[var(--text3)] hover:text-red-400 transition-colors px-2"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}