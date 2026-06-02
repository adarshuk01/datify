import React, { useRef } from 'react'
import ProfileSetupLayout from '../../components/profile/ProfileSetupLayout'
import { useProfileSetupStore } from '../../store/profileSetupStore'

const DistanceStep = ({ onNext, onBack }) => {
  const { distance, setDistance, currentStep, totalSteps } = useProfileSetupStore()
  const trackRef = useRef()

  const MIN = 5
  const MAX = 300

  const percent = ((distance - MIN) / (MAX - MIN)) * 100

  const handleSliderChange = (e) => {
    setDistance(Number(e.target.value))
  }

  return (
    <ProfileSetupLayout
      step={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      onContinue={onNext}
    >
      <h1 className="text-[26px] font-extrabold text-gray-900 mb-2 flex items-center gap-2">
        Find matches nearby <span>📍</span>
      </h1>
      <p className="text-gray-500 text-sm leading-relaxed mb-10">
        Select your preferred distance range to discover matches conveniently. We'll help you find
        love close by.
      </p>

      {/* Label + value */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-base font-bold text-gray-900">Distance Preference</span>
        <span className="text-base text-gray-500 font-medium">{distance} km</span>
      </div>

      {/* Custom styled range slider */}
      <div className="relative" ref={trackRef}>
        {/* Track background */}
        <div className="relative h-1.5 rounded-full bg-gray-200">
          {/* Filled part */}
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-primary-600"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Native range input (invisible, overlaid) */}
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={5}
          value={distance}
          onChange={handleSliderChange}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          style={{ height: '24px', top: '-11px' }}
        />

        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none"
          style={{ left: `${percent}%` }}
        >
          <div className="w-7 h-7 rounded-full bg-white border-4 border-primary-600 shadow-md shadow-primary-200" />
        </div>
      </div>
    </ProfileSetupLayout>
  )
}

export default DistanceStep
