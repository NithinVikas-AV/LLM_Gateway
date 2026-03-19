import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { LayoutDashboard, Key, Terminal, Users, Sun, Moon } from 'lucide-react'
import useAuthStore from './store/authStore'
import useThemeStore from './store/themeStore'
import Login from './pages/Login'
import AuthSuccess from './pages/AuthSuccess'
import Dashboard from './pages/Dashboard'
import Keys from './pages/Keys'
import UsersPage from './pages/Users'
import Playground from './pages/Playground'

function ProtectedRoute({ children, adminOnly = false }) {
  const { token, user } = useAuthStore()
  if (!token) return <Navigate to="/login" />
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" />
  return children
}

function Sidebar() {
  const { user, logout } = useAuthStore()
  const { dark, toggle } = useThemeStore()

  const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/keys', icon: Key, label: 'Keys' },
    { to: '/playground', icon: Terminal, label: 'Playground' },
    ...(user?.role === 'admin' ? [{ to: '/users', icon: Users, label: 'Users' }] : []),
  ]

  return (
    <aside className="w-52 flex-shrink-0 flex flex-col border-r border-[var(--border)] bg-[var(--bg2)] min-h-screen px-3 py-4">
      <div className="flex items-center gap-2 px-2 mb-6">
        <div className="w-6 h-6 rounded-md bg-[var(--accent)] flex items-center justify-center">
          <span className="text-white text-xs font-bold">L</span>
        </div>
        <span className="font-semibold text-sm text-[var(--text)]">LLM Gateway</span>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--text2)] hover:bg-[var(--bg3)] hover:text-[var(--text)]'
              }`
            }
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-[var(--border)] pt-3 mt-3 flex flex-col gap-2">
        <button
          onClick={toggle}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--text2)] hover:bg-[var(--bg3)] transition-colors"
        >
          {dark ? <Sun size={15} /> : <Moon size={15} />}
          {dark ? 'Light mode' : 'Dark mode'}
        </button>
        <div className="flex items-center gap-2.5 px-3 py-2">
          {user?.picture
            ? <img src={user.picture} className="w-6 h-6 rounded-full" alt="" />
            : <div className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-xs">{user?.name?.[0]}</div>
          }
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[var(--text)] truncate">{user?.name}</p>
            <p className="text-xs text-[var(--text3)] truncate">{user?.role}</p>
          </div>
          <button onClick={logout} className="text-xs text-[var(--text3)] hover:text-red-400 transition-colors">out</button>
        </div>
      </div>
    </aside>
  )
}

function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}

export default function App() {
  const { init } = useThemeStore()
  useEffect(() => { init() }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/keys" element={<ProtectedRoute><Layout><Keys /></Layout></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute adminOnly><Layout><UsersPage /></Layout></ProtectedRoute>} />
        <Route path="/playground" element={<ProtectedRoute><Layout><Playground /></Layout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  )
}