import api from './client'

export const getMyUsage = () => api.get('/usage/logs')
export const getMySummary = () => api.get('/usage/summary')
export const getAllUsage = () => api.get('/usage/admin/all')
export const getAllSummary = () => api.get('/usage/admin/summary')