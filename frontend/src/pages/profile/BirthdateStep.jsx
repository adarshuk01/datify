import React, { useRef } from 'react'
import ProfileSetupLayout from '../../components/profile/ProfileSetupLayout'
import { useProfileSetupStore } from '../../store/profileSetupStore'

const BirthdateStep = ({ onNext, onBack }) => {
  const { birthdate, setBirthdate, currentStep, totalSteps } = useProfileSetupStore()
  const ddRef = useRef()
  const yyyyRef = useRef()

  const handleChange = (field, value, maxLen, nextRef) => {
    if (!/^\d*$/.test(value)) return
    setBirthdate({ ...birthdate, [field]: value })
    if (value.length === maxLen && nextRef?.current) {
      nextRef.current.focus()
    }
  }

  const isValid =
    birthdate.mm.length === 2 &&
    birthdate.dd.length === 2 &&
    birthdate.yyyy.length === 4 &&
    Number(birthdate.mm) >= 1 &&
    Number(birthdate.mm) <= 12 &&
    Number(birthdate.dd) >= 1 &&
    Number(birthdate.dd) <= 31 &&
    Number(birthdate.yyyy) >= 1900 &&
    Number(birthdate.yyyy) <= new Date().getFullYear() - 18

  return (
    <ProfileSetupLayout
      step={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      onContinue={onNext}
      continueDisabled={!isValid}
    >
      <h1 className="text-[26px] font-extrabold text-gray-900 mb-2 flex items-center gap-2">
        Let's celebrate you <span>🎂</span>
      </h1>
      <p className="text-gray-500 text-sm leading-relaxed mb-8">
        Tell us your birthdate. Your profile does not display your birthdate, only your age.
      </p>

      {/* Cake emoji */}
      <div className="flex justify-center mb-10">
        <span className="text-[90px] leading-none select-none">🎂</span>
      </div>

      {/* MM / DD / YYYY inputs */}
      <div className="flex items-center justify-center gap-0">
        {/* MM */}
        <div className="flex-1 flex flex-col items-center">
          <input
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={birthdate.mm}
            onChange={(e) => handleChange('mm', e.target.value, 2, ddRef)}
            placeholder="MM"
            className="w-full text-center text-3xl font-bold text-gray-400 bg-transparent
                       border-none outline-none placeholder-gray-300 py-2"
          />
          <div className="w-full h-px bg-gray-200 mt-1" />
        </div>

        <span className="text-gray-300 text-2xl font-light px-2 pb-2">|</span>

        {/* DD */}
        <div className="flex-1 flex flex-col items-center">
          <input
            ref={ddRef}
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={birthdate.dd}
            onChange={(e) => handleChange('dd', e.target.value, 2, yyyyRef)}
            placeholder="DD"
            className="w-full text-center text-3xl font-bold text-gray-400 bg-transparent
                       border-none outline-none placeholder-gray-300 py-2"
          />
          <div className="w-full h-px bg-gray-200 mt-1" />
        </div>

        <span className="text-gray-300 text-2xl font-light px-2 pb-2">|</span>

        {/* YYYY */}
        <div className="flex-[2] flex flex-col items-center">
          <input
            ref={yyyyRef}
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={birthdate.yyyy}
            onChange={(e) => handleChange('yyyy', e.target.value, 4, null)}
            placeholder="YYYY"
            className="w-full text-center text-3xl font-bold text-gray-400 bg-transparent
                       border-none outline-none placeholder-gray-300 py-2"
          />
          <div className="w-full h-px bg-gray-200 mt-1" />
        </div>
      </div>
    </ProfileSetupLayout>
  )
}

export default BirthdateStep
