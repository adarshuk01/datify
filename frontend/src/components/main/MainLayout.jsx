// src/components/main/MainLayout.jsx
import { Outlet } from 'react-router-dom'
import BottomTabBar from './BottomTabBar'

/**
 * MainLayout — wraps main tab pages.
 * topBarProps=false means each page renders its own TopBar (which we do).
 */
const MainLayout = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* MIDDLE — each page renders its own TopBar + content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* BOTTOM — fixed tab bar */}
      <BottomTabBar />
    </div>
  )
}

export default MainLayout
