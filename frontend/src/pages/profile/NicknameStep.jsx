import React from 'react'
import ProfileSetupLayout from '../../components/profile/ProfileSetupLayout'
import { useProfileSetupStore } from '../../store/profileSetupStore'

const NicknameStep = ({ onNext, onBack }) => {
  const { nickname, setNickname, currentStep, totalSteps } = useProfileSetupStore()

  return (
    <ProfileSetupLayout
      step={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      onContinue={onNext}
      continueDisabled={nickname.trim().length < 2}
    >
      <h1 className="text-[26px] font-extrabold text-gray-900 mb-2 flex items-center gap-2 flex-wrap">
        Your datify identity <span>😎</span>
      </h1>
      <p className="text-gray-500 text-sm leading-relaxed mb-8">
        Create a unique nickname that represents you. It's how others will know and remember you.
      </p>

      <input
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="Nickname"
        maxLength={30}
        className="w-full py-5 px-5 bg-gray-100 rounded-2xl text-gray-800 text-lg
                   font-medium placeholder-gray-400 border-2 border-transparent
                   focus:border-primary-400 focus:bg-white focus:outline-none
                   transition-all duration-200 text-center"
      />
    </ProfileSetupLayout>
  )
}

export default NicknameStep
