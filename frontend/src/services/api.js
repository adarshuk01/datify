import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// In-memory token — updated by authStore whenever it changes.
// This avoids stale localStorage reads on paginated requests.
let _token = null

export const setApiToken = (token) => {
  _token = token
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

// On module init, seed from localStorage so the token survives page refresh
try {
  const raw = localStorage.getItem('datify-auth')
  if (raw) {
    const parsed = JSON.parse(raw)
    const token = parsed?.state?.token
    if (token) setApiToken(token)
  }
} catch (_) {}

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || ''
      const isAuthEndpoint =
        url.includes('/auth/login') ||
        url.includes('/auth/signup') ||
        url.includes('/auth/resend') ||
        url.includes('/auth/forgot') ||
        url.includes('/auth/reset') ||
        url.includes('/auth/verify')

      if (!isAuthEndpoint) {
        setApiToken(null)
        localStorage.removeItem('datify-auth')
        localStorage.removeItem('datify-profile-setup')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
