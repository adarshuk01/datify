import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import authService from '../services/authService'
import api, { setApiToken } from '../services/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          // authService.login now returns { token, user } directly
          const { token, user } = await authService.login(email, password)
          setApiToken(token)
          set({ user, token, isAuthenticated: true, isLoading: false, error: null })
          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed. Please try again.'
          set({ isLoading: false, error: message })
          return { success: false, message }
        }
      },

      signup: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const data = await authService.signup(email, password)
          set({ isLoading: false, error: null })
          return { success: true, data }
        } catch (error) {
          const message = error.response?.data?.message || 'Signup failed. Please try again.'
          set({ isLoading: false, error: message })
          return { success: false, message }
        }
      },

      refreshUser: async () => {
        try {
          // getProfile returns { user }
          const { user } = await authService.getProfile()
          if (user) set({ user })
        } catch (_) {}
      },

      updateUser: (updates) => {
        set((state) => ({ user: state.user ? { ...state.user, ...updates } : updates }))
      },

      logout: () => {
        setApiToken(null)
        set({ user: null, token: null, isAuthenticated: false, error: null })
        localStorage.removeItem('datify-profile-setup')
      },

      resendVerification: async (email) => {
        try {
          await authService.resendVerification(email)
          return { success: true }
        } catch (error) {
          return { success: false, message: error.response?.data?.message || 'Failed to resend' }
        }
      },
    }),
    {
      name: 'datify-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) setApiToken(state.token)
      },
    }
  )
)
