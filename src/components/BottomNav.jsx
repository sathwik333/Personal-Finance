import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, BarChart2, Tag } from 'lucide-react'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/reports', icon: BarChart2, label: 'Reports' },
  { to: '/categories', icon: Tag, label: 'Categories' },
]

export default function BottomNav() {
  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 flex md:hidden z-40 px-4 pb-safe-area-inset-bottom"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
    >
      <div
        className="flex w-full rounded-2xl overflow-hidden mx-auto"
        style={{
          background: 'rgba(15, 18, 33, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 -4px 30px rgba(0,0,0,0.4)',
          marginBottom: '8px',
        }}
      >
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-all duration-200 cursor-pointer ${
                isActive ? 'text-accent' : 'text-gray-500 hover:text-gray-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-accent/15' : ''
                }`}>
                  <Icon size={19} aria-hidden="true" />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                  )}
                </div>
                <span className={isActive ? 'text-accent' : ''}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
