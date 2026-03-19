import api from './client'

export const getUsers = () => api.get('/users/')
export const updateRole = (userId, role) => api.patch(`/users/${userId}/role`, { role })
export const deactivateUser = (userId) => api.patch(`/users/${userId}/deactivate`)