import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Settings } from 'lucide-react'
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
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="hidden md:flex items-center bg-surface border-b border-gray-800 px-6 h-14 gap-1">
      <span className="text-white font-semibold mr-8">💰 Finance</span>
      {links.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isActive ? 'bg-accent/20 text-accent' : 'text-gray-400 hover:text-white'
            }`
          }
        >
          {label}
        </NavLink>
      ))}
      <div className="ml-auto flex items-center gap-2">
        <NavLink to="/settings" className={({ isActive }) =>
          `p-2 rounded-md transition-colors ${isActive ? 'text-accent' : 'text-gray-400 hover:text-white'}`
        }>
          <Settings size={18} />
        </NavLink>
        <button onClick={handleSignOut} className="p-2 text-gray-400 hover:text-white transition-colors">
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  )
}
