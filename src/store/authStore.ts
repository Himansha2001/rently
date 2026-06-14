import { create } from 'zustand'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth'
import { apiFetch } from '@/lib/api'
import { firebaseAuth } from '@/lib/firebase'
import type { User, UserRole } from '@/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  hydrated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (
    name: string,
    email: string,
    password: string,
    options?: { isRenter?: boolean; isLandlord?: boolean },
  ) => Promise<boolean>
  refreshProfile: () => Promise<User | null>
  updateProfile: (patch: Partial<Pick<User, 'name' | 'phone' | 'isRenter' | 'isLandlord'>>) => Promise<void>
  logout: () => Promise<void>
}

interface BackendUser {
  id: string
  email: string
  displayName?: string
  name?: string
  phone?: string
  avatarUrl?: string
  roles?: UserRole[]
  isEmailVerified?: boolean
  status?: User['status']
}

function normalizeUser(user: BackendUser): User {
  const roles: UserRole[] = user.roles?.length ? user.roles : ['user']
  return {
    id: user.id,
    name: user.name ?? user.displayName ?? user.email.split('@')[0] ?? 'User',
    email: user.email,
    phone: user.phone,
    avatar: user.avatarUrl,
    roles,
    isRenter: roles.includes('user'),
    isLandlord: roles.includes('landlord'),
    isEmailVerified: user.isEmailVerified,
    status: user.status,
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  hydrated: false,

  login: async (email, password) => {
    set({ loading: true })
    await signInWithEmailAndPassword(firebaseAuth, email, password)
    await get().refreshProfile()
    set({ loading: false })
    return true
  },

  register: async (name, email, password) => {
    set({ loading: true })
    const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
    await updateFirebaseProfile(credential.user, { displayName: name })
    await credential.user.getIdToken(true)
    const profile = await apiFetch<BackendUser>('/auth/session', {
      method: 'POST',
      auth: true,
    })
    const normalized = normalizeUser({ ...profile, name })
    set({ user: normalized, isAuthenticated: true, loading: false })
    return true
  },

  refreshProfile: async () => {
    if (!firebaseAuth.currentUser) {
      set({ user: null, isAuthenticated: false, hydrated: true })
      return null
    }
    const profile = await apiFetch<BackendUser>('/auth/session', {
      method: 'POST',
      auth: true,
    })
    const normalized = normalizeUser(profile)
    set({ user: normalized, isAuthenticated: true, hydrated: true })
    return normalized
  },

  updateProfile: async patch => {
    const profile = await apiFetch<BackendUser>('/auth/me', {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify({
        name: patch.name,
        displayName: patch.name,
        phone: patch.phone,
      }),
    })
    set({ user: normalizeUser(profile), isAuthenticated: true })
  },

  logout: async () => {
    await signOut(firebaseAuth)
    set({ user: null, isAuthenticated: false })
  },
}))

onAuthStateChanged(firebaseAuth, async currentUser => {
  if (!currentUser) {
    useAuthStore.setState({ user: null, isAuthenticated: false, hydrated: true, loading: false })
    return
  }

  try {
    await useAuthStore.getState().refreshProfile()
  } catch {
    useAuthStore.setState({ user: null, isAuthenticated: false, hydrated: true, loading: false })
  }
})
