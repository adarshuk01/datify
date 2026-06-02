import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { IoSearchOutline, IoOptions, IoArrowBack } from 'react-icons/io5'
import { MdNotificationsNone } from 'react-icons/md'
import { FaStar } from 'react-icons/fa'
import Logo from '../common/Logo'

/**
 * TopBar — shared across all main tabs.
 *
 * Props:
 *  title        – center text            (default 'Datify')
 *  showSearch   – show search icon       (default false)
 *  showNotif    – show notification icon (default true)
 *  showFilter   – show filter/options    (default false)
 *  showUpgrade  – show UPGRADE badge     (default false)
 *  showSettings – show settings gear     (default false)
 *  onSearchClick – callback for search   (default: navigate to /search)
 *  onFilterClick – callback for filter
 *  onBack       – if set, show back arrow instead of logo
 */
const TopBar = ({
  title        = 'Datify',
  showSearch   = false,
  showNotif    = false,
  showFilter   = false,
  showUpgrade  = false,
  showSettings = false,
  onSearchClick,
  onFilterClick,
  onBack,
}) => {
  const navigate = useNavigate()

  const handleSearch = () => {
    if (onSearchClick) onSearchClick()
    else navigate('/search')
  }

  return (
    <div className="flex items-center justify-between px-5 pt-12 pb-3 bg-white border-b border-gray-50">
      {/* Left */}
      <div className="w-9 h-9 flex items-center justify-center">
        {onBack ? (
          <button
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
          >
            <IoArrowBack className="text-xl text-gray-700" />
          </button>
        ) : (
          <Logo size="sm" showText={false} light={false} />
        )}
      </div>

      {/* Center */}
      <span className="text-base font-bold text-gray-900">{title}</span>

      {/* Right */}
      <div className="flex items-center gap-1">
        {showUpgrade && (
          <button className="px-3 py-1.5 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center gap-1">
            <FaStar className="text-yellow-300 text-xs" /> UPGRADE
          </button>
        )}
        {showSettings && (
          <button
            onClick={() => navigate('/settings')}
            className="w-9 h-9 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </button>
        )}
        {showNotif && (
          <button className="w-9 h-9 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
            <MdNotificationsNone className="text-[22px]" />
          </button>
        )}
        {showSearch && (
          <button
            onClick={handleSearch}
            className="w-9 h-9 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <IoSearchOutline className="text-[20px]" />
          </button>
        )}
        {showFilter && (
          <button
            onClick={onFilterClick}
            className="w-9 h-9 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <IoOptions className="text-[20px]" />
          </button>
        )}
      </div>
    </div>
  )
}

export default TopBar
