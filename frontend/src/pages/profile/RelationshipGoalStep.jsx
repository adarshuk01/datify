import React from 'react'
import ProfileSetupLayout from '../../components/profile/ProfileSetupLayout'
import { useProfileSetupStore } from '../../store/profileSetupStore'

const GOALS = [
  {
    id: 'dating',
    label: 'Dating',
    emoji: '👫',
    description: 'Seeking love and meaningful connections? Choose dating for genuine relationships.',
  },
  {
    id: 'friendship',
    label: 'Friendship',
    emoji: '🙌',
    description: 'Expand your social circle and make new friends. Opt for friendship today.',
  },
  {
    id: 'casual',
    label: 'Casual',
    emoji: '😁',
    description: 'Looking for fun and relaxed encounters? Select casual for carefree connections.',
  },
  {
    id: 'serious',
    label: 'Serious Relationship',
    emoji: '💍',
    description: 'Ready for commitment and a lasting partnership? Pick serious relationship.',
  },
]

const RelationshipGoalStep = ({ onNext, onBack }) => {
  const { relationshipGoal, setRelationshipGoal, currentStep, totalSteps } = useProfileSetupStore()

  return (
    <ProfileSetupLayout
      step={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      onContinue={onNext}
      continueDisabled={!relationshipGoal}
    >
      <h1 className="text-[26px] font-extrabold text-gray-900 mb-2 flex items-center gap-2 flex-wrap">
        Your relationship goals <span>💘</span>
      </h1>
      <p className="text-gray-500 text-sm leading-relaxed mb-6">
        Choose the type of relationship you're seeking on Datify. Love, friendship, or something in
        between—it's your choice.
      </p>

      <div className="flex flex-col gap-3">
        {GOALS.map((goal) => {
          const isSelected = relationshipGoal === goal.id
          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => setRelationshipGoal(goal.id)}
              className={`
                w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200
                active:scale-[0.98]
                ${isSelected
                  ? 'border-primary-600 bg-white shadow-md shadow-primary-100'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <p className="font-bold text-gray-900 text-base mb-1">
                {goal.label} <span>{goal.emoji}</span>
              </p>
              <p className="text-gray-500 text-sm leading-snug">{goal.description}</p>
            </button>
          )
        })}
      </div>
    </ProfileSetupLayout>
  )
}

export default RelationshipGoalStep
