import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaHeart, FaStar, FaComments, FaUser } from 'react-icons/fa'
import { IoSettingsOutline } from 'react-icons/io5'
import { MdNotificationsNone } from 'react-icons/md'
import Button from '../components/common/Button'
import Logo from '../components/common/Logo'
import { useAuthStore } from '../store/authStore'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="px-5 pt-12 pb-5 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #7C3AED, #9333EA)' }}
      >
        <Logo size="sm" showText={false} light />
        <span className="text-white font-bold text-base">Datify</span>
        <div className="flex items-center gap-3">
          <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
            <MdNotificationsNone className="text-lg" />
          </button>
          <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
            <IoSettingsOutline className="text-base" />
          </button>
        </div>
      </div>

      {/* Welcome */}
      <div className="px-5 py-5">
        <h2 className="text-xl font-bold text-gray-900">
          Welcome back, {user?.name || user?.email?.split('@')[0] || 'User'}! 👋
        </h2>
        <p className="text-sm text-gray-500 mt-1">You're all set to find your perfect match.</p>
      </div>

      {/* Profile setup CTA */}
      <div className="mx-5 mb-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <FaUser className="text-primary-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">Complete your profile</p>
            <p className="text-xs text-gray-500">Get 3x more matches with a complete profile</p>
          </div>
          <span className="text-sm font-bold text-primary-600">
            {user?.profileCompletion || 15}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
          <div
            className="h-2 rounded-full bg-primary-600 transition-all duration-500"
            style={{ width: `${user?.profileCompletion || 15}%` }}
          />
        </div>
        <button
          onClick={() => navigate('/profile-setup')}
          className="w-full py-2.5 rounded-xl bg-primary-50 text-primary-600 text-sm font-semibold
                     hover:bg-primary-100 transition-colors active:scale-95"
        >
          Complete Setup →
        </button>
      </div>

      {/* Stats */}
      <div className="px-5 grid grid-cols-3 gap-3 mb-4">
        {[
          { icon: FaHeart, label: 'Matches', count: 85, bg: 'bg-pink-50', color: 'text-pink-500' },
          { icon: FaStar, label: 'Likes', count: 24, bg: 'bg-yellow-50', color: 'text-yellow-500' },
          { icon: FaComments, label: 'Chats', count: 12, bg: 'bg-blue-50', color: 'text-blue-500' },
        ].map(({ icon: Icon, label, count, bg, color }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 flex flex-col items-center gap-1.5`}>
            <Icon className={`text-2xl ${color}`} />
            <span className="text-xl font-bold text-gray-800">{count}</span>
            <span className="text-xs text-gray-500 font-medium">{label}</span>
          </div>
        ))}
      </div>

      <div className="flex-1" />

      {/* Logout */}
      <div className="px-5 pb-10">
        <Button variant="outline" onClick={handleLogout}>Log out</Button>
      </div>
    </div>
  )
}

export default Dashboard
