import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { IoHomeOutline, IoHome } from 'react-icons/io5'
import { IoChatbubbleOutline, IoChatbubble } from 'react-icons/io5'
import { IoPersonOutline, IoPerson } from 'react-icons/io5'
import { PiSparkle, PiSparkleFill } from 'react-icons/pi'
import { useChatStore } from '../../store/chatStore'

const TABS = [
  {
    key: 'home',
    label: 'Home',
    path: '/main/home',
    Icon: IoHomeOutline,
    ActiveIcon: IoHome,
  },
  {
    key: 'matches',
    label: 'Matches',
    path: '/main/matches',
    Icon: PiSparkle,
    ActiveIcon: PiSparkleFill,
  },
  {
    key: 'chats',
    label: 'Chats',
    path: '/main/chats',
    Icon: IoChatbubbleOutline,
    ActiveIcon: IoChatbubble,
  },
  {
    key: 'profile',
    label: 'Profile',
    path: '/main/profile',
    Icon: IoPersonOutline,
    ActiveIcon: IoPerson,
  },
]

const BottomTabBar = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { totalUnread } = useChatStore()

  return (
    <div
      className=" fixed bottom-0 left-0 w-full flex items-center justify-around bg-white border-t border-gray-100 pb-safe"
      style={{ height: 64, flexShrink: 0 }}
    >
      {TABS.map((tab) => {
        const isActive = pathname === tab.path
        const Icon = isActive ? tab.ActiveIcon : tab.Icon
        const showBadge = tab.key === 'chats' && totalUnread > 0

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => navigate(tab.path)}
            className="flex flex-col items-center justify-center flex-1 h-full gap-1
                       focus:outline-none active:scale-90 transition-transform duration-150 relative"
          >
            <div className="relative">
              <Icon
                className={`text-2xl transition-colors duration-200 ${
                  isActive ? 'text-primary-600' : 'text-gray-400'
                }`}
              />
              {showBadge && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 rounded-full bg-primary-600 text-white text-[9px] flex items-center justify-center font-bold px-0.5">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] font-semibold transition-colors duration-200 ${
                isActive ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default BottomTabBar
