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
    <nav aria-label="Main navigation" className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-800 flex md:hidden z-40">
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 gap-1 text-xs transition-colors ${
              isActive ? 'text-accent' : 'text-gray-500'
            }`
          }
        >
          <Icon size={20} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
