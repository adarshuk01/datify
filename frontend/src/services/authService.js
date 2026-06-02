import api from './api'

const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data.data  // → { token, user }
  },

  signup: async (email, password) => {
    const response = await api.post('/auth/signup', { email, password })
    return response.data.data  // → { email, id }
  },

  resendVerification: async (email) => {
    const response = await api.post('/auth/resend-verification', { email })
    return response.data
  },

  verifyEmail: async (token) => {
    const response = await api.get(`/auth/verify-email/${token}`)
    return response.data.data  // → { token, user }
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  // Use /users/profile (includes photos with _id for delete operations)
  getProfile: async () => {
    const response = await api.get('/users/profile')
    return response.data.data  // → { user }
  },
}

export default authService
