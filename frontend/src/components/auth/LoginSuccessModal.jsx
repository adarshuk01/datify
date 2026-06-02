import React from 'react'
import Spinner from '../common/Spinner'

const LoginSuccessModal = ({ isOpen }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-8"
      style={{ position: 'absolute' }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center animate-scale-in">
        {/* Avatar circle with dots */}
        <div className="relative mb-6">
          {/* Decorative dots */}
          <div className="absolute -top-2 -left-4 w-4 h-4 rounded-full bg-primary-600" />
          <div className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-primary-600" />
          <div className="absolute top-4 -right-5 w-3 h-3 rounded-full bg-primary-600" />
          <div className="absolute bottom-0 -left-3 w-2 h-2 rounded-full bg-primary-600" />
          <div className="absolute -bottom-2 right-2 w-2 h-2 rounded-full bg-primary-600" />
          <div className="absolute top-1/2 -right-7 w-1.5 h-1.5 rounded-full bg-primary-600" />

          {/* Avatar */}
          <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center">
            <svg viewBox="0 0 48 48" className="w-14 h-14 fill-white">
              <circle cx="24" cy="18" r="8" />
              <path d="M8 40c0-8.8 7.2-16 16-16s16 7.2 16 16H8z" />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-bold text-primary-600 mb-2 text-center">
          Log in Successful!
        </h2>
        <p className="text-gray-500 text-sm text-center mb-1">Please wait...</p>
        <p className="text-gray-500 text-sm text-center mb-6">
          You will be directed to the homepage.
        </p>

        <Spinner size="md" color="purple" />
      </div>
    </div>
  )
}

export default LoginSuccessModal
