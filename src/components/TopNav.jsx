import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Settings, TrendingUp } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/reports', label: 'Reports' },
  { to: '/categories', label: 'Categories' },
]

export default function TopNav() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    try { await signOut() } catch {}
    navigate('/login')
  }

  return (
    <nav
      aria-label="Main navigation"
      className="hidden md:flex items-center px-6 h-16 gap-1 sticky top-0 z-40"
      style={{
        background: 'rgba(8, 11, 24, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex items-center gap-2 mr-8">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-900/50">
          <TrendingUp size={14} className="text-white" aria-hidden="true" />
        </div>
        <span className="text-white font-bold tracking-tight">Finely</span>
      </div>

      {links.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              isActive
                ? 'text-accent bg-accent/10 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`
          }
        >
          {label}
        </NavLink>
      ))}

      <div className="ml-auto flex items-center gap-1">
        <NavLink
          to="/settings"
          aria-label="Settings"
          className={({ isActive }) =>
            `p-2 rounded-lg transition-all duration-200 cursor-pointer ${
              isActive ? 'text-accent bg-accent/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`
          }
        >
          <Settings size={17} aria-hidden="true" />
        </NavLink>
        <button
          onClick={handleSignOut}
          aria-label="Sign out"
          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 cursor-pointer"
        >
          <LogOut size={17} aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}
