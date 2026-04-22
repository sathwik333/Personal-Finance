import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import TopNav from './TopNav'
import BottomNav from './BottomNav'

export default function Layout() {
  const location = useLocation()
  const mainRef = useRef(null)

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.classList.remove('page-enter')
      void mainRef.current.offsetWidth
      mainRef.current.classList.add('page-enter')
    }
  }, [location.pathname])

  return (
    <div style={{ minHeight: '100dvh', position: 'relative' }}>
      {/* Fixed gradient background — separate from body so it never blocks scroll */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          background: '#080B18',
          backgroundImage: `
            radial-gradient(ellipse 60% 50% at 15% 10%, rgba(124,58,237,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 85% 85%, rgba(59,130,246,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 60% 40%, rgba(167,139,250,0.06) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        }}
      />

      <TopNav />
      <main
        ref={mainRef}
        className="pb-28 md:pb-8 max-w-3xl mx-auto px-4 pt-5 page-enter"
      >
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
