import { Outlet } from 'react-router-dom'
import TopNav from './TopNav'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="min-h-screen bg-base">
      <TopNav />
      <main className="pb-20 md:pb-0 max-w-3xl mx-auto px-4 pt-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
