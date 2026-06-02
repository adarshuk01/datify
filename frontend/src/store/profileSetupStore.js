import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

export const useProfileSetupStore = create(
  persist(
    (set, get) => ({
      currentStep: 1,
      totalSteps: 8,
      nickname: '',
      birthdate: { mm: '', dd: '', yyyy: '' },
      gender: '',
      relationshipGoal: '',
      distance: 80,
      interests: [],
      photos: [],
      locationGranted: false,
      coordinates: null,   // [longitude, latitude]
      isLoading: false,
      error: null,

      setNickname:         (nickname)  => set({ nickname }),
      setBirthdate:        (birthdate) => set({ birthdate }),
      setGender:           (gender)    => set({ gender }),
      setRelationshipGoal: (goal)      => set({ relationshipGoal: goal }),
      setDistance:         (distance)  => set({ distance }),
      setLocationGranted:  (val)       => set({ locationGranted: val }),
      setCoordinates:      (lng, lat)  => set({ coordinates: [lng, lat] }),
      setCurrentStep:      (step)      => set({ currentStep: step }),
      nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, s.totalSteps) })),
      prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 1) })),

      toggleInterest: (interest) => {
        const { interests } = get()
        if (interests.includes(interest)) {
          set({ interests: interests.filter((i) => i !== interest) })
        } else if (interests.length < 5) {
          set({ interests: [...interests, interest] })
        }
      },

      addPhoto: (photo) => {
        const { photos } = get()
        if (photos.length < 6) set({ photos: [...photos, photo] })
      },

      removePhoto: (index) => {
        const { photos } = get()
        if (photos[index]?.preview) URL.revokeObjectURL(photos[index].preview)
        set({ photos: photos.filter((_, i) => i !== index) })
      },

      // Called from LocationStep only when an existing user (already has profile)
      // was redirected here just to grant location — only send coordinates
      submitLocationOnly: async () => {
        set({ isLoading: true, error: null })
        const { coordinates } = get()
        try {
          await api.put('/users/profile', {
            location: { coordinates },
          })
          set({ isLoading: false })
          return { success: true }
        } catch (err) {
          const message = err.response?.data?.message || 'Failed to save location. Please try again.'
          set({ isLoading: false, error: message })
          return { success: false, message }
        }
      },

      // Full profile setup — called at end of all 8 steps for new users
      submitProfile: async () => {
        set({ isLoading: true, error: null })
        const s = get()

        const { mm, dd, yyyy } = s.birthdate
        const dob = new Date(`${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`)
        const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))

        try {
          await api.put('/users/profile', {
            name:                s.nickname,
            age:                 isNaN(age) ? undefined : age,
            gender:              s.gender === 'Man' ? 'male' : s.gender === 'Woman' ? 'female' : 'other',
            interestedIn:        'everyone',
            interests:           s.interests,
            relationshipGoal:    s.relationshipGoal,
            distancePreference:  s.distance,
            profileSetupComplete: true,
            ...(s.coordinates ? { location: { coordinates: s.coordinates } } : {}),
          })

          for (const photo of s.photos) {
            if (photo.file instanceof File) {
              const formData = new FormData()
              formData.append('photo', photo.file)
              await api.post('/users/photos', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
              })
            }
          }

          set({ isLoading: false })
          return { success: true }
        } catch (err) {
          const message = err.response?.data?.message || 'Failed to save profile. Please try again.'
          set({ isLoading: false, error: message })
          return { success: false, message }
        }
      },

      reset: () => set({
        currentStep: 1,
        nickname: '',
        birthdate: { mm: '', dd: '', yyyy: '' },
        gender: '',
        relationshipGoal: '',
        distance: 80,
        interests: [],
        photos: [],
        locationGranted: false,
        coordinates: null,
        isLoading: false,
        error: null,
      }),
    }),
    {
      name: 'datify-profile-setup',
      partialize: (s) => ({
        currentStep:      s.currentStep,
        nickname:         s.nickname,
        birthdate:        s.birthdate,
        gender:           s.gender,
        relationshipGoal: s.relationshipGoal,
        distance:         s.distance,
        interests:        s.interests,
        locationGranted:  s.locationGranted,
        photos: s.photos.filter((p) => !p.file).map((p) => ({ preview: p.preview })),
      }),
    }
  )
)