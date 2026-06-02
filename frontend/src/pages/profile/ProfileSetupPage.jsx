import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileSetupStore } from '../../store/profileSetupStore'
import NicknameStep from './NicknameStep'
import BirthdateStep from './BirthdateStep'
import GenderStep from './GenderStep'
import RelationshipGoalStep from './RelationshipGoalStep'
import DistanceStep from './DistanceStep'
import InterestsStep from './InterestsStep'
import PhotosStep from './PhotosStep'
import LocationStep from './LocationStep'

const STEPS = {
  1: NicknameStep,
  2: BirthdateStep,
  3: GenderStep,
  4: RelationshipGoalStep,
  5: DistanceStep,
  6: InterestsStep,
  7: PhotosStep,
  8: LocationStep,
}

const ProfileSetupPage = () => {
  const navigate = useNavigate()
  const { currentStep, nextStep, prevStep, totalSteps } = useProfileSetupStore()

  const StepComponent = STEPS[currentStep]

  const handleBack = () => {
    if (currentStep === 1) {
      navigate('/dashboard')
    } else {
      prevStep()
    }
  }

  const handleNext = () => {
    nextStep()
  }

  if (!StepComponent) return null

  return (
    <StepComponent
      onNext={handleNext}
      onBack={handleBack}
      totalSteps={Object.keys(STEPS).length}
    />
  )
}

export default ProfileSetupPage
