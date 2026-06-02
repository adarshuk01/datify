import React from 'react'
import { useNavigate } from 'react-router-dom'
import { IoArrowBack } from 'react-icons/io5'

const BackButton = ({ onClick, className = '' }) => {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onClick) {
      onClick()
    } else {
      navigate(-1)
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`
        w-10 h-10 flex items-center justify-center rounded-full
        text-gray-700 hover:bg-gray-100 transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-300
        ${className}
      `}
      aria-label="Go back"
    >
      <IoArrowBack className="text-xl" />
    </button>
  )
}

export default BackButton
