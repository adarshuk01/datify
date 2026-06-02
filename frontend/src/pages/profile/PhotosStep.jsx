import React, { useRef } from 'react'
import { IoAddOutline, IoCloseCircle } from 'react-icons/io5'
import ProfileSetupLayout from '../../components/profile/ProfileSetupLayout'
import { useProfileSetupStore } from '../../store/profileSetupStore'

const MAX_PHOTOS = 6

const PhotosStep = ({ onNext, onBack }) => {
  const { photos, addPhoto, removePhoto, currentStep, totalSteps } = useProfileSetupStore()
  const inputRef = useRef()

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (photos.length >= MAX_PHOTOS) return

    const preview = URL.createObjectURL(file)
    addPhoto({ preview, file })

    // reset so same file can be re-picked
    e.target.value = ''
  }

  const slots = Array.from({ length: MAX_PHOTOS })

  return (
    <ProfileSetupLayout
      step={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      onContinue={onNext}
    >
      <h1 className="text-[26px] font-extrabold text-gray-900 mb-2 flex items-center gap-2">
        Show your best self <span>📸</span>
      </h1>
      <p className="text-gray-500 text-sm leading-relaxed mb-7">
        Upload up to six of your best photos to make a fantastic first impression. Let your
        personality shine.
      </p>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 3×2 grid */}
      <div className="grid grid-cols-3 gap-3">
        {slots.map((_, idx) => {
          const photo = photos[idx]
          return (
            <div
              key={idx}
              className="relative rounded-2xl overflow-hidden bg-gray-100 border-2 border-gray-100"
              style={{ paddingTop: '130%' }}
            >
              {photo ? (
                <>
                  {/* Preview */}
                  <img
                    src={photo.preview}
                    alt={`Photo ${idx + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1.5 right-1.5 bg-white rounded-full shadow-md
                               text-gray-700 hover:text-red-500 transition-colors"
                  >
                    <IoCloseCircle className="text-2xl" />
                  </button>
                </>
              ) : (
                /* Empty slot — tap to add */
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={photos.length >= MAX_PHOTOS}
                  className="absolute inset-0 flex items-center justify-center
                             disabled:cursor-not-allowed group"
                >
                  <IoAddOutline
                    className="text-3xl text-gray-400 group-hover:text-primary-400
                               transition-colors"
                  />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </ProfileSetupLayout>
  )
}

export default PhotosStep
