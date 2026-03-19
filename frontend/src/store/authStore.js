import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,

      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),

      logout: () => {
        set({ token: null, user: null })
        window.location.href = '/login'
      },
    }),
    {
      name: 'auth-storage', // saves to localStorage automatically
    }
  )
)

export default useAuthStore