// src/components/main/MainLayout.jsx
import { Outlet } from 'react-router-dom'
import BottomTabBar from './BottomTabBar'

/**
 * MainLayout — wraps the four main tab pages.
 * Structure: flex-col, full height, no overflow leakage.
 *   - <main> is flex-1 + overflow-y-auto: each page scrolls inside here
 *   - <BottomTabBar> is flex-shrink-0: always pinned at the bottom
 */
const MainLayout = () => {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  )
}

export default MainLayout
