import React, { useState, useEffect } from 'react'
import { IoLocationOutline, IoWarningOutline, IoCheckmarkCircle } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import ProfileSetupLayout from '../../components/profile/ProfileSetupLayout'
import { useProfileSetupStore } from '../../store/profileSetupStore'
import { useAuthStore } from '../../store/authStore'

const LocationStep = ({ onBack }) => {
  const navigate = useNavigate()
  const {
    setLocationGranted, setCoordinates,
    submitProfile, submitLocationOnly,
    currentStep, totalSteps, isLoading,
    coordinates,
  } = useProfileSetupStore()
  const { user, refreshUser, updateUser } = useAuthStore()
  const [requesting, setRequesting] = useState(false)
  const [denied, setDenied] = useState(false)
  const [granted, setGranted] = useState(false)

  // If user already has a complete profile (redirected just for location), use location-only submit
  const isLocationOnlyUpdate = !!user?.profileSetupComplete

  // Auto-request on mount if permission might already be granted
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          // Permission already granted — auto-fetch
          fetchLocation()
        }
      }).catch(() => {})
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchLocation = () => {
    setDenied(false)
    setRequesting(true)

    if (!('geolocation' in navigator)) {
      setRequesting(false)
      setDenied(true)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { longitude, latitude, accuracy } = pos.coords
        setLocationGranted(true)
        setCoordinates(longitude, latitude)
        setGranted(true)
        setRequesting(false)
        console.log(`📍 Location acquired: [${longitude}, ${latitude}] ±${Math.round(accuracy)}m`)
        await doSubmit(longitude, latitude)
      },
      (err) => {
        console.warn('Geolocation denied:', err.message)
        setLocationGranted(false)
        setRequesting(false)
        setDenied(true)
        setGranted(false)
      },
      { timeout: 15000, maximumAge: 60000, enableHighAccuracy: false }
    )
  }

  const doSubmit = async (lng, lat) => {
    // Pass coordinates directly to avoid stale store state
    const submitFn = isLocationOnlyUpdate ? submitLocationOnly : submitProfile

    // Ensure coordinates are in store before calling submit
    setCoordinates(lng, lat)

    // Small delay to let zustand update propagate
    await new Promise((r) => setTimeout(r, 100))

    const result = await submitFn()

    if (result.success) {
      await refreshUser()
      toast.success(
        isLocationOnlyUpdate ? 'Location saved! 📍' : 'Profile created! Welcome to Datify 💜',
        { autoClose: 2500 }
      )
      if (!isLocationOnlyUpdate) {
        useProfileSetupStore.getState().reset()
      }
      navigate(isLocationOnlyUpdate ? '/main/home' : '/finding-nearby', { replace: true })
    } else {
      toast.error(result.message || 'Something went wrong. Please try again.')
      setGranted(false)
    }
  }

  const handleAllow = () => {
    fetchLocation()
  }

  const continueLabel = requesting || isLoading
    ? 'Getting location…'
    : denied
    ? 'Try Again'
    : granted
    ? 'Location acquired!'
    : 'Allow Location'

  return (
    <ProfileSetupLayout
      step={currentStep}
      totalSteps={totalSteps}
      onBack={isLocationOnlyUpdate ? null : onBack}
      onContinue={handleAllow}
      continueLabel={continueLabel}
      loading={requesting || isLoading}
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-8 transition-colors duration-300 ${
          denied ? 'bg-red-50' : granted ? 'bg-green-50' : 'bg-gray-100'
        }`}>
          {granted ? (
            <IoCheckmarkCircle className="text-5xl text-green-500" />
          ) : (
            <IoLocationOutline className={`text-5xl ${denied ? 'text-red-400' : 'text-gray-800'}`} />
          )}
        </div>

        <h2 className="text-2xl font-extrabold text-gray-900 mb-4">
          {granted ? 'Location Found!' : isLocationOnlyUpdate ? 'Location Required' : 'Enable Location'}
        </h2>

        {granted ? (
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
            Your location has been set. Setting up your profile…
          </p>
        ) : denied ? (
          <>
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-4 max-w-xs">
              <IoWarningOutline className="text-red-500 text-xl shrink-0" />
              <p className="text-red-600 text-sm text-left leading-snug">
                Location access was denied. Please allow it in your browser settings and try again.
              </p>
            </div>
            <p className="text-gray-400 text-xs max-w-xs leading-relaxed">
              Open your browser's site settings, enable location for this site, then tap{' '}
              <span className="font-semibold">Try Again</span>.
            </p>
          </>
        ) : (
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
            {isLocationOnlyUpdate
              ? 'Your location is needed to show you people nearby. Please allow access to continue using Datify.'
              : 'Datify needs your location to show you people nearby. Tap Allow Location and accept the browser prompt.'}
          </p>
        )}

        {/* Permission instructions */}
        {!denied && !granted && !requesting && (
          <div className="mt-6 bg-primary-50 rounded-2xl px-4 py-3 max-w-xs">
            <p className="text-primary-700 text-xs leading-relaxed">
              📍 When the browser asks for permission, tap <strong>Allow</strong> to enable location access.
            </p>
          </div>
        )}
      </div>
    </ProfileSetupLayout>
  )
}

export default LocationStep
