import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SavedState {
  byUser: Record<string, string[]>
  toggle: (userId: string, listingId: string) => void
  isSaved: (userId: string, listingId: string) => boolean
  getSavedIds: (userId: string) => string[]
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      byUser: {
        u1: ['3', '10', '14'],
      },

      toggle: (userId, listingId) => {
        set(state => {
          const current = state.byUser[userId] ?? []
          const next = current.includes(listingId)
            ? current.filter(id => id !== listingId)
            : [...current, listingId]
          return { byUser: { ...state.byUser, [userId]: next } }
        })
      },

      isSaved: (userId, listingId) => (get().byUser[userId] ?? []).includes(listingId),

      getSavedIds: userId => get().byUser[userId] ?? [],
    }),
    { name: 'rently-saved' },
  ),
)
