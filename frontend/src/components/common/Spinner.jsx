import React from 'react'

const Spinner = ({ size = 'md', color = 'white', className = '' }) => {
  const sizeMap = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  const colorMap = {
    white: 'border-white/30 border-t-white',
    purple: 'border-primary-200 border-t-primary-600',
    gray: 'border-gray-200 border-t-gray-600',
  }

  return (
    <div
      className={`
        ${sizeMap[size]}
        ${colorMap[color]}
        border-4 rounded-full animate-spin
        ${className}
      `}
    />
  )
}

export default Spinner
