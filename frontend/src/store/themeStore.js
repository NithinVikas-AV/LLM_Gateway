import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useThemeStore = create(
  persist(
    (set) => ({
      dark: true,
      toggle: () => set((s) => {
        const next = !s.dark
        document.documentElement.classList.toggle('dark', next)
        return { dark: next }
      }),
      init: () => {
        const stored = JSON.parse(localStorage.getItem('theme-storage') || '{}')
        const dark = stored?.state?.dark ?? true
        document.documentElement.classList.toggle('dark', dark)
      }
    }),
    { name: 'theme-storage' }
  )
)

export default useThemeStore