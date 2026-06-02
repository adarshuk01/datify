import api from './api'

const userService = {
  updateProfile: async (data) => {
    const res = await api.put('/users/profile', data)
    return res.data
  },

  uploadPhoto: async (file) => {
    const formData = new FormData()
    formData.append('photo', file)
    const res = await api.post('/users/photos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  deletePhoto: async (photoId) => {
    const res = await api.delete(`/users/photos/${photoId}`)
    return res.data
  },

  discoverUsers: async (page = 1, limit = 10) => {
    const res = await api.get(`/users/discover?page=${page}&limit=${limit}`)
    return res.data
  },

  searchUsers: async (query, page = 1) => {
    const res = await api.get(`/users/search?q=${encodeURIComponent(query)}&page=${page}`)
    return res.data
  },

  // Get another user's public profile
  getPublicProfile: async (userId) => {
    const res = await api.get(`/users/${userId}/profile`)
    return res.data
  },

  // Filter preferences
  getFilters: async () => {
    const res = await api.get('/users/filters')
    return res.data
  },

  updateFilters: async (filters) => {
    const res = await api.put('/users/filters', { filters })
    return res.data
  },

  likeUser: async (userId) => {
    const res = await api.post(`/users/${userId}/like`)
    return res.data
  },

  superLikeUser: async (userId) => {
    const res = await api.post(`/users/${userId}/super-like`)
    return res.data
  },

  passUser: async (userId) => {
    const res = await api.post(`/users/${userId}/pass`)
    return res.data
  },

  getMatches: async () => {
    const res = await api.get('/users/matches')
    return res.data
  },
}

export default userService
