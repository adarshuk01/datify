import React from 'react'
import { IoArrowBack } from 'react-icons/io5'
import Button from '../common/Button'

const ProfileSetupLayout = ({
  children,
  step,
  totalSteps,
  onBack,
  onContinue,
  continueLabel = 'Continue',
  continueDisabled = false,
  loading = false,
}) => {
  const progress = (step / totalSteps) * 100

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ── Top bar: back + progress ── */}
      <div className="flex items-center gap-4 px-5 pt-12 pb-2">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full
                     text-gray-800 hover:bg-gray-100 transition-colors flex-shrink-0
                     focus:outline-none"
          aria-label="Go back"
        >
          <IoArrowBack className="text-xl" />
        </button>

        {/* Progress bar */}
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ── Page content ── */}
      <div className="flex-1 flex flex-col px-5 pt-6 pb-4 overflow-y-auto">
        {children}
      </div>

      {/* ── Continue button pinned to bottom ── */}
      <div className="px-5 pb-8 pt-2 bg-white">
        <Button
          variant="primary"
          onClick={onContinue}
          disabled={continueDisabled || loading}
          loading={loading}
          fullWidth
        >
          {continueLabel}
        </Button>
      </div>
    </div>
  )
}

export default ProfileSetupLayout
