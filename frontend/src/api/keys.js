import api from './client'

export const addProviderKey = (data) => api.post('/keys/provider', data)
export const getProviderKeys = () => api.get('/keys/provider')
export const deleteProviderKey = (provider) => api.delete(`/keys/provider/${provider}`)

export const createUniversalKey = (data) => api.post('/keys/universal', data)
export const getUniversalKeys = () => api.get('/keys/universal')
export const revokeUniversalKey = (id) => api.delete(`/keys/universal/${id}`)

export const setPermission = (keyId, data) => api.post(`/keys/universal/${keyId}/permissions`, data)
export const getPermissions = (keyId) => api.get(`/keys/universal/${keyId}/permissions`)