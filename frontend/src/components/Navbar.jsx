import { Link, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const location = useLocation()

  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/keys', label: 'Keys' },
    { to: '/playground', label: 'Playground' },
    ...(user?.role === 'admin' ? [{ to: '/users', label: 'Users' }] : []),
  ]

  return (
    <nav className="border-b bg-white px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-slate-800">LLM Gateway</span>
          <div className="flex gap-4">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm ${location.pathname === link.to
                  ? 'text-slate-900 font-medium'
                  : 'text-slate-500 hover:text-slate-800'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user?.picture && (
            <img src={user.picture} className="w-7 h-7 rounded-full" alt="" />
          )}
          <span className="text-sm text-slate-600">{user?.name}</span>
          <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
        </div>
      </div>
    </nav>
  )
}