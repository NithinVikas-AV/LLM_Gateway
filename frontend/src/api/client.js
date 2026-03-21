import axios from 'axios'
import useAuthStore from '../store/authStore'

const API_URL = typeof process !== 'undefined' && process.env.NODE_ENV === 'production'
  ? 'https://llmgateway-production.up.railway.app'
  : ''

const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

export default api