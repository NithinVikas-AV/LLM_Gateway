import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import axios from 'axios'

const API_URL = import.meta.env.PROD
  ? 'https://llmgateway-production.up.railway.app'
  : 'http://localhost:8000'

export default function AuthSuccess() {
  const navigate = useNavigate()
  const { setToken, setUser } = useAuthStore()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (!token) {
      navigate('/login')
      return
    }

    setToken(token)

    // Use axios directly with full URL — not the api client
    // because the interceptor might not have the token yet
    axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setUser(res.data)
        navigate('/dashboard')
      })
      .catch(() => {
        navigate('/login')
      })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <p className="text-[var(--text3)]">Signing you in...</p>
    </div>
  )
}