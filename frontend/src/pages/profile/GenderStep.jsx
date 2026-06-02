import React from 'react'
import { IoChevronForward } from 'react-icons/io5'
import ProfileSetupLayout from '../../components/profile/ProfileSetupLayout'
import { useProfileSetupStore } from '../../store/profileSetupStore'

const GENDERS = ['Man', 'Woman', 'More']

const GenderStep = ({ onNext, onBack }) => {
  const { gender, setGender, currentStep, totalSteps } = useProfileSetupStore()

  const handleSelect = (g) => {
    if (g === 'More') return // expand more options — simplified for now
    setGender(g)
  }

  return (
    <ProfileSetupLayout
      step={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      onContinue={onNext}
      continueDisabled={!gender}
    >
      <h1 className="text-[26px] font-extrabold text-gray-900 mb-2 flex items-center gap-2">
        Be true to yourself <span>🌟</span>
      </h1>
      <p className="text-gray-500 text-sm leading-relaxed mb-8">
        Choose the gender that best represents you. Authenticity is key to meaningful connections.
      </p>

      <div className="flex flex-col gap-4">
        {GENDERS.map((g) => {
          const isSelected = gender === g
          const isMore = g === 'More'

          return (
            <button
              key={g}
              type="button"
              onClick={() => handleSelect(g)}
              className={`
                w-full py-4 px-6 rounded-full font-semibold text-base text-center
                flex items-center justify-center transition-all duration-200 active:scale-95
                ${isSelected
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                  : 'border-2 border-gray-200 text-gray-900 bg-white hover:border-primary-300'
                }
              `}
            >
              <span className="flex-1">{g}</span>
              {isMore && (
                <IoChevronForward className="text-gray-400 text-lg ml-2" />
              )}
            </button>
          )
        })}
      </div>
    </ProfileSetupLayout>
  )
}

export default GenderStep
