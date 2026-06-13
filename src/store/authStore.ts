import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (
    name: string,
    email: string,
    password: string,
    options?: { isRenter?: boolean; isLandlord?: boolean },
  ) => Promise<boolean>
  updateProfile: (patch: Partial<Pick<User, 'name' | 'phone' | 'isRenter' | 'isLandlord'>>) => void
  logout: () => void
}

const DEMO_USER: User = {
  id: 'u1',
  name: 'Nimal Perera',
  email: 'demo@rently.lk',
  phone: '+94771234567',
  isRenter: true,
  isLandlord: true,
}

function normalizeUser(user: Partial<User> & Pick<User, 'id' | 'name' | 'email'>): User {
  return {
    ...user,
    isRenter: user.isRenter ?? true,
    isLandlord: user.isLandlord ?? true,
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email, _password) => {
        await new Promise(r => setTimeout(r, 400))
        const user = normalizeUser({
          ...DEMO_USER,
          email,
          name: email.split('@')[0] ?? 'User',
        })
        set({ user, isAuthenticated: true })
        return true
      },

      register: async (name, email, _password, options) => {
        await new Promise(r => setTimeout(r, 400))
        const user = normalizeUser({
          id: `user-${Date.now()}`,
          name,
          email,
          isRenter: options?.isRenter ?? true,
          isLandlord: options?.isLandlord ?? false,
        })
        set({ user, isAuthenticated: true })
        return true
      },

      updateProfile: patch => {
        set(state => ({
          user: state.user ? normalizeUser({ ...state.user, ...patch }) : null,
        }))
      },

      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'rently-auth',
      merge: (persisted, current) => {
        const p = persisted as Partial<AuthState>
        return {
          ...current,
          isAuthenticated: p.isAuthenticated ?? current.isAuthenticated,
          user: p.user ? normalizeUser(p.user) : current.user,
        }
      },
    },
  ),
)
