import api from './client'

export const getUsers = () => api.get('/admin/users')
export const deactivateUser = (userId) => api.patch(`/admin/users/${userId}/deactivate`)
export const activateUser = (userId) => api.patch(`/admin/users/${userId}/activate`)
export const getAllUsageSummary = () => api.get('/admin/usage')