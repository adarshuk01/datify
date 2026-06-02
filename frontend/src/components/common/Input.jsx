import React, { useState } from 'react'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  icon: Icon,
  error,
  required = false,
  className = '',
  autoComplete,
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          {label}
          {required && <span className="text-primary-600 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-lg z-10">
            <Icon />
          </span>
        )}
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`
            w-full py-4 bg-gray-50 rounded-xl text-gray-800 text-sm
            border-2 transition-all duration-200
            placeholder:text-gray-400
            focus:outline-none focus:bg-white focus:border-primary-400
            ${error ? 'border-red-400 bg-red-50' : 'border-transparent'}
            ${Icon ? 'pl-11' : 'pl-4'}
            ${isPassword ? 'pr-12' : 'pr-4'}
          `}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-xl"
            tabIndex={-1}
          >
            {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}

export default Input
