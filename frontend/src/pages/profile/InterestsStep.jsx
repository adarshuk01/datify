import React, { useState, useMemo } from 'react'
import { IoSearchOutline } from 'react-icons/io5'
import ProfileSetupLayout from '../../components/profile/ProfileSetupLayout'
import { useProfileSetupStore } from '../../store/profileSetupStore'

const ALL_INTERESTS = [
  { label: 'Travel', emoji: '✈️' },
  { label: 'Cooking', emoji: '🔍' },
  { label: 'Hiking', emoji: '🏔️' },
  { label: 'Yoga', emoji: '🧘' },
  { label: 'Gaming', emoji: '🎮' },
  { label: 'Movies', emoji: '🎥' },
  { label: 'Photography', emoji: '📷' },
  { label: 'Music', emoji: '🎵' },
  { label: 'Pets', emoji: '🐱' },
  { label: 'Painting', emoji: '🎨' },
  { label: 'Art', emoji: '🎨' },
  { label: 'Fitness', emoji: '💪' },
  { label: 'Reading', emoji: '📖' },
  { label: 'Dancing', emoji: '🕺' },
  { label: 'Sports', emoji: '🏀' },
  { label: 'Board Games', emoji: '🎲' },
  { label: 'Technology', emoji: '📱' },
  { label: 'Fashion', emoji: '👗' },
  { label: 'Motorcycling', emoji: '🏍️' },
]

const MAX_INTERESTS = 5

const InterestsStep = ({ onNext, onBack }) => {
  const { interests, toggleInterest, currentStep, totalSteps } = useProfileSetupStore()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return ALL_INTERESTS
    return ALL_INTERESTS.filter((i) =>
      i.label.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  const selected = interests.length
  const canContinue = selected >= 1

  return (
    <ProfileSetupLayout
      step={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      onContinue={onNext}
      continueLabel={`Continue (${selected}/${MAX_INTERESTS})`}
      continueDisabled={!canContinue}
    >
      <h1 className="text-[26px] font-extrabold text-gray-900 mb-2 flex items-center gap-2 flex-wrap">
        Discover like-minded people <span>🤗</span>
      </h1>
      <p className="text-gray-500 text-sm leading-relaxed mb-5">
        Share your interests, passions, and hobbies. We'll connect you with people who share your
        enthusiasm.
      </p>

      {/* Search bar */}
      <div className="relative mb-5">
        <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search interest"
          className="w-full pl-11 pr-4 py-3.5 bg-gray-100 rounded-2xl text-sm text-gray-700
                     placeholder-gray-400 border-2 border-transparent focus:border-primary-300
                     focus:bg-white focus:outline-none transition-all duration-200"
        />
      </div>

      {/* Interest chips */}
      <div className="flex flex-wrap gap-2.5">
        {filtered.map((item) => {
          const isSelected = interests.includes(item.label)
          const isDisabled = !isSelected && selected >= MAX_INTERESTS

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => toggleInterest(item.label)}
              disabled={isDisabled}
              className={`
                px-4 py-2.5 rounded-full text-sm font-semibold border-2
                transition-all duration-200 active:scale-95 flex items-center gap-1.5
                ${isSelected
                  ? 'bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-100'
                  : isDisabled
                  ? 'border-gray-200 text-gray-300 bg-white cursor-not-allowed'
                  : 'border-gray-200 text-gray-800 bg-white hover:border-primary-300'
                }
              `}
            >
              <span>{item.label}</span>
              <span>{item.emoji}</span>
            </button>
          )
        })}
      </div>
    </ProfileSetupLayout>
  )
}

export default InterestsStep
