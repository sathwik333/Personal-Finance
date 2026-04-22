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
    <div className="min-h-dvh" style={{ background: 'transparent' }}>
      <TopNav />
      <main
        ref={mainRef}
        className="pb-24 md:pb-8 max-w-3xl mx-auto px-4 pt-5 page-enter"
      >
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
