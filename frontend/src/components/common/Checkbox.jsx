import React from 'react'

const Checkbox = ({ checked, onChange, label, labelAction, id }) => {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        id={id}
        onClick={() => onChange(!checked)}
        className={`
          w-6 h-6 rounded-md border-2 flex items-center justify-center
          transition-all duration-200 flex-shrink-0
          ${checked
            ? 'bg-primary-600 border-primary-600'
            : 'bg-white border-primary-500 hover:border-primary-600'
          }
        `}
      >
        {checked && (
          <svg
            viewBox="0 0 12 10"
            fill="none"
            className="w-3 h-3"
          >
            <path
              d="M1 5l3.5 3.5L11 1"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
      <label htmlFor={id} className="text-sm text-gray-700 cursor-pointer select-none">
        {label}
        {labelAction && (
          <span
            onClick={labelAction.onClick}
            className="text-primary-600 font-medium cursor-pointer hover:underline ml-1"
          >
            {labelAction.text}
          </span>
        )}
      </label>
    </div>
  )
}

export default Checkbox
