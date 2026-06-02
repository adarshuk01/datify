import React from 'react'

const Logo = ({ size = 'md', showText = true, light = true }) => {
  const sizeMap = {
    sm: { icon: 40, text: 'text-lg' },
    md: { icon: 60, text: 'text-2xl' },
    lg: { icon: 80, text: 'text-3xl' },
  }

  const { icon, text } = sizeMap[size]

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Chat bubble with heart icon */}
      <div
        style={{ width: icon, height: icon }}
        className="relative flex items-center justify-center"
      >
        <svg
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Chat bubble */}
          <path
            d="M40 8C22.3 8 8 20.9 8 36.8c0 8.2 3.8 15.6 9.9 20.7L14 68l13.2-5.4C30.8 63.8 35.2 64.6 40 64.6c17.7 0 32-13 32-28.8S57.7 8 40 8z"
            fill={light ? 'white' : '#7C3AED'}
          />
          {/* Heart inside */}
          <path
            d="M40 50l-1.4-1.3C32 42.3 27 37.8 27 32.3c0-4.4 3.4-7.8 7.8-7.8 2.5 0 4.9 1.2 6.2 3 1.3-1.8 3.7-3 6.2-3 4.4 0 7.8 3.4 7.8 7.8 0 5.5-5 10-11.6 16.4L40 50z"
            fill={light ? '#7C3AED' : 'white'}
          />
        </svg>
      </div>
      {showText && (
        <span
          className={`${text} font-bold tracking-wide ${light ? 'text-white' : 'text-primary-700'}`}
        >
          Datify
        </span>
      )}
    </div>
  )
}

export default Logo
