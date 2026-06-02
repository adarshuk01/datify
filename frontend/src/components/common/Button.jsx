import React from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  fullWidth = true,
  size = 'md',
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100'

  const sizeClasses = {
    sm: 'py-2.5 px-5 text-sm',
    md: 'py-4 px-6 text-base',
    lg: 'py-5 px-8 text-lg',
  }

  const variantClasses = {
    primary:
      'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-400 shadow-lg shadow-primary-200',
    secondary:
      'bg-primary-100 text-primary-600 hover:bg-primary-200 focus:ring-primary-300',
    outline:
      'border-2 border-primary-600 text-primary-600 bg-transparent hover:bg-primary-50 focus:ring-primary-300',
    ghost:
      'text-primary-600 bg-transparent hover:bg-primary-50 focus:ring-primary-300',
    danger:
      'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <>
          <AiOutlineLoading3Quarters className="animate-spin mr-2 text-lg" />
          <span>Please wait...</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}

export default Button
