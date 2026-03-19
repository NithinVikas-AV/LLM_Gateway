import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { getMe } from '../api/auth'

export default function AuthSuccess() {
  const navigate = useNavigate()
  const { setToken, setUser } = useAuthStore()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    console.log("Token found:", token ? "YES" : "NO")
    console.log("Token value:", token?.slice(0, 30) + "...")

    if (!token) {
      console.log("No token — redirecting to login")
      navigate('/login')
      return
    }

    setToken(token)
    console.log("Token saved to store")

    getMe(token)
      .then(res => {
        console.log("User info:", res.data)
        setUser(res.data)
        navigate('/dashboard')
      })
      .catch(err => {
        console.log("getMe failed:", err.response?.status, err.response?.data)
        navigate('/login')
      })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500">Signing you in...</p>
    </div>
  )
}