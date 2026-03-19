import api from './client'

export const getMe = (token) => api.get('/auth/me', {
  headers: token ? { Authorization: `Bearer ${token}` } : {}
})