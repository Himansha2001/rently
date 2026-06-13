import { create } from 'zustand'
import { listingRepository } from '@/data'
import type { CreateListingInput, Listing, ListingFilters } from '@/types'

interface ListingState {
  listings: Listing[]
  featured: Listing[]
  current: Listing | null
  loading: boolean
  error: string | null
  fetchAll: (filters?: ListingFilters) => Promise<void>
  fetchFeatured: () => Promise<void>
  fetchById: (id: string) => Promise<void>
  fetchByOwner: (ownerId: string) => Promise<Listing[]>
  create: (input: CreateListingInput, ownerId: string) => Promise<Listing>
  clearCurrent: () => void
}

export const useListingStore = create<ListingState>((set) => ({
  listings: [],
  featured: [],
  current: null,
  loading: false,
  error: null,

  fetchAll: async (filters) => {
    set({ loading: true, error: null })
    try {
      const listings = await listingRepository.getAll(filters)
      set({ listings, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  fetchFeatured: async () => {
    try {
      const featured = await listingRepository.getFeatured(6)
      set({ featured })
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  fetchById: async (id) => {
    set({ loading: true, error: null, current: null })
    try {
      const current = await listingRepository.getById(id)
      if (current) await listingRepository.incrementViews(id)
      set({ current, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  fetchByOwner: async (ownerId) => {
    return listingRepository.getByOwner(ownerId)
  },

  create: async (input, ownerId) => {
    const listing = await listingRepository.create(input, ownerId)
    set(state => ({ listings: [listing, ...state.listings] }))
    return listing
  },

  clearCurrent: () => set({ current: null }),
}))
