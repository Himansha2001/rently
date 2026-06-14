import { create } from 'zustand'
import { apiFetch } from '@/lib/api'
import type { Listing } from '@/types'

interface SavedState {
  byUser: Record<string, string[]>
  listingsByUser: Record<string, Listing[]>
  sync: (userId: string) => Promise<void>
  toggle: (userId: string, listingId: string) => void
  isSaved: (userId: string, listingId: string) => boolean
  getSavedIds: (userId: string) => string[]
  getSavedListings: (userId: string) => Listing[]
}

export const useSavedStore = create<SavedState>()((set, get) => ({
  byUser: {},
  listingsByUser: {},

  sync: async userId => {
    const listings = await apiFetch<Listing[]>('/me/saved-listings', { auth: true })
    set(state => ({
      listingsByUser: { ...state.listingsByUser, [userId]: listings },
      byUser: { ...state.byUser, [userId]: listings.map(l => l.id) },
    }))
  },

  toggle: (userId, listingId) => {
    const currentlySaved = get().isSaved(userId, listingId)
    set(state => {
      const current = state.byUser[userId] ?? []
      const next = currentlySaved
        ? current.filter(id => id !== listingId)
        : [...current, listingId]
      return { byUser: { ...state.byUser, [userId]: next } }
    })

    void apiFetch(`/me/saved-listings/${listingId}`, {
      method: currentlySaved ? 'DELETE' : 'POST',
      auth: true,
    }).catch(() => {
      void get().sync(userId)
    })
  },

  isSaved: (userId, listingId) => (get().byUser[userId] ?? []).includes(listingId),

  getSavedIds: userId => get().byUser[userId] ?? [],

  getSavedListings: userId => get().listingsByUser[userId] ?? [],
}))
