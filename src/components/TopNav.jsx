import { useState, useRef, useEffect } from 'react'
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
  const [showConfirm, setShowConfirm] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const popoverRef = useRef(null)
  const btnRef = useRef(null)

  useEffect(() => {
    if (!showConfirm) return
    function handleClick(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target) && !btnRef.current.contains(e.target)) {
        setShowConfirm(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showConfirm])

  async function handleConfirmSignOut() {
    setSigningOut(true)
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

      <div className="ml-auto flex items-center gap-1 relative">
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
          ref={btnRef}
          onClick={() => setShowConfirm(s => !s)}
          aria-label="Sign out"
          aria-expanded={showConfirm}
          className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${
            showConfirm ? 'text-expense bg-expense/10' : 'text-gray-400 hover:text-expense hover:bg-expense/10'
          }`}
        >
          <LogOut size={17} aria-hidden="true" />
        </button>

        {showConfirm && (
          <div
            ref={popoverRef}
            className="absolute top-full right-0 mt-2 w-52 rounded-2xl p-4 z-50 animate-scale-in"
            style={{
              background: 'rgba(10, 12, 28, 0.97)',
              border: '1px solid rgba(255,255,255,0.10)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
              transformOrigin: 'top right',
            }}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-expense/15 flex items-center justify-center flex-shrink-0">
                <LogOut size={15} className="text-expense" aria-hidden="true" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Sign out?</p>
                <p className="text-gray-500 text-xs font-body">You'll need to sign back in</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSignOut}
                disabled={signingOut}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-200 cursor-pointer disabled:opacity-60"
                style={{ background: 'rgba(248,113,113,0.2)', border: '1px solid rgba(248,113,113,0.3)' }}
              >
                {signingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
